const CartItem = require("../../models/cartItem");
const { Op } = require("sequelize");
const Product = require("../../models/product");
const ProductIngrediant = require("../../models/productIngrediant");
const Ingrediant = require("../../models/ingrediant");
const Store = require("../../models/store");
const { getImage } = require("../../lib/helper");

// const addToCart = async (req, res, next) => {
//   try {
//     const product = await Product.findByPk(req.body.product_id, {
//       attributes: ["id", "name", "category_id", "price"],
//       include: [
//         {
//           model: Ingrediant,
//           as: "ingrediants",
//           through: {
//             model: ProductIngrediant,
//             attributes: {
//               include: ["is_required"],
//             },
//           },
//         },
//         "productCategory",
//       ],
//     });

//     if (!product) {
//       throw new Error("Invalid product id provided.");
//     }

//     const store = await Store.findByPk(req.body.store_id);

//     if (!store) {
//       throw new Error("Invalid store id provided.");
//     }

//     if (product?.productCategory?.name.toLowerCase() !== "pizza") {
//       const cartItem = await CartItem.create({
//         user_id: req.user.id,
//         product_id: product.id,
//         quantity: req.body.quantity,
//         store_id: store.id,
//       });

//       return res.json({
//         success: true,
//         data: cartItem,
//       });
//     }

//     let cartData = {
//       user_id: req.user.id,
//       product_id: product.id,
//       size: req.body.size,
//       crust_type: req.body.crust_type,
//       gluten_free: req.body.gluten_free,
//       quantity: req.body.quantity,
//       ingrediants: req.body.ingrediants,
//       store_id: req.body.store_id,
//       notes: req.body.notes,
//     };

//     const cartItem = await CartItem.create(cartData);

//     return res.json({
//       success: true,
//       data: cartItem,
//     });
//   } catch (error) {
//     next(error);
//   }
// };



const addToCart = async (req, res, next) => {
  try {
    // Find the product by ID
    const product = await Product.findByPk(req.body.product_id, {
      attributes: ["id", "name", "category_id", "price"],
      include: [
        {
          model: Ingrediant,
          as: "ingrediants",
          through: {
            model: ProductIngrediant,
            attributes: {
              include: ["is_required"],
            },
          },
        },
        "productCategory",
      ],
    });

    if (!product) {
      throw new Error("Invalid product id provided.");
    }

    // Find the store by ID
    const store = await Store.findByPk(req.body.store_id);

    if (!store) {
      throw new Error("Invalid store id provided.");
    }

    // Prepare cart item search criteria
    const existingCartItems = await CartItem.findAll({
      where: {
        user_id: req.user.id,
        product_id: product.id,
        store_id: store.id,
        size: req.body.size,
        crust_type: req.body.crust_type,
        gluten_free: req.body.gluten_free,
      },
    });

    // Function to compare two ingredient sets (custom and required)
    const isSameIngrediants = (existingIngrediants, newIngrediants) => {
      return (
        JSON.stringify(existingIngrediants.required) ===
          JSON.stringify(newIngrediants.required) &&
        JSON.stringify(existingIngrediants.custom) ===
          JSON.stringify(newIngrediants.custom)
      );
    };

    // Check if any existing cart item has the same ingredients
    let matchingCartItem = null;
    if (existingCartItems.length) {
      for (let item of existingCartItems) {
        const existingIngrediants = item.ingrediants;
        if (isSameIngrediants(existingIngrediants, req.body.ingrediants)) {
          matchingCartItem = item;
          break;
        }
      }
    }

    // If a matching cart item is found, update the quantity
    if (matchingCartItem) {
      matchingCartItem.quantity += req.body.quantity;
      await matchingCartItem.save();

      return res.json({
        success: true,
        data: matchingCartItem,
      });
    }

    // If the cart item does not exist, create a new one
    const cartData = {
      user_id: req.user.id,
      product_id: product.id,
      store_id: store.id,
      quantity: req.body.quantity,
      notes: req.body.notes,
    };

    if (product?.productCategory?.name.toLowerCase() === "pizza") {
      cartData.size = req.body.size;
      cartData.crust_type = req.body.crust_type;
      cartData.gluten_free = req.body.gluten_free;
      cartData.ingrediants = req.body.ingrediants; // Save the ingredients as JSON string
    }

    const newCartItem = await CartItem.create(cartData);

    return res.json({
      success: true,
      data: newCartItem,
    });
  } catch (error) {
    next(error);
  }
};



const editCart = async (req, res, next) => {
  try {
    let cartItem = await CartItem.findByPk(req.params.id);

    cartItem.quantity = req.body?.quantity || cartItem.quantity;
    cartItem.notes = req.body?.notes || cartItem.notes;
    await cartItem.save();

    return res.json({
      success: true,
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const cartItems = await CartItem.findByPk(req.params.id);

    if (!cartItems) {
      throw new Error("Invalid cart id provided");
    }

    await cartItems.destroy();

    return res.json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    next(error);
  }
};

const getCartItems = async (req, res, next) => {
  try {
    let subtotal = 0.0,
      tax = 0.0,
      itemsCount = 0,
      country,
      store;

    const cartItems = await CartItem.findAll({
      include: [
        "store",
        {
          model: Product,
          as: "product",
          include: [
            {
              model: Ingrediant,
              as: "ingrediants",
              through: {
                model: ProductIngrediant,
                attributes: ["is_required"],
              },
            },
            "productCategory",
          ],
        },
      ],
      where: { user_id: req.user.id },
    });

    if (!cartItems?.length) {
      return res.json({
        success: true,
        data: {
          cartItems: [],
        },
      });
    }

    store = cartItems[0].store;
    country = store.country;

    for (const item of cartItems) {
      let product = item.product,
        category = product?.productCategory?.name,
        unitPrice = 0,
        price;
      if (product.image) {
        item.product.image = await getImage(
          process.env.AWS_BUCKET_NAME,
          item.product.image
        );
      }
      const priceExist = product.price.some((p) => {
        if (p.country === country) {
          price = parseFloat(
            category === "Pizza" ? p.price[item.size] : p.price
          );
          return true;
        }
      });

      if (!priceExist) {
        throw new Error("Product price for your country not found.");
      }

      unitPrice += price;

      if (category === "Pizza") {
        if (item?.gluten_free && store?.gluten_free_price) {
          unitPrice += parseFloat(store?.gluten_free_price[item.size] ?? 0);
        }

        let defaultIngrediants = 0;
        let removedIngrediants = [];
        if (item.ingrediants?.custom?.length === 0) {
          product.ingrediants.forEach((ingrediant) => {
            if (
              ingrediant.is_required &&
              !item.ingrediants.required.includes(ingrediant.id)
            ) {
              removedIngrediants.push(ingrediant.name);
            }
          });
          item.dataValues.removedIngrediants = removedIngrediants;
        } else {
          product.ingrediants.forEach((ingrediant) => {
            if (ingrediant.is_required) {
              defaultIngrediants++;
              !item.ingrediants?.required?.includes(ingrediant.id) &&
                removedIngrediants.push(ingrediant.name);
            }
          });
          item.dataValues.removedIngrediants = removedIngrediants;
          const removedRequiredIngrediants =
          console.log(item.ingrediants)
            defaultIngrediants - item.ingrediants.required.length;

          const ingrediantsToAddToTotal = item.ingrediants.custom.slice(
            removedRequiredIngrediants,
            item.ingrediants.custom.length
          );

          if (ingrediantsToAddToTotal.length > 0) {
            product.ingrediants.forEach((ingrediant) => {
              if (ingrediantsToAddToTotal.includes(ingrediant.id)) {
                unitPrice += ingrediant.price;
              }
            });
          }
        }
      }

      const totalAmount = unitPrice * item.quantity;
      itemsCount += item?.quantity;
      item.dataValues.amount = unitPrice;
      subtotal += totalAmount;
    }
    let total =
      req?.query?.type === "pickup"
        ? subtotal
        : subtotal + store?.delivery_charge;

    tax = total - total / ((store.tax + 100) / 100);

    return res.json({
      success: true,
      data: {
        cartItems,
        total,
        subtotal,
        itemsCount,
        tax,
        delivery: store?.delivery_charge,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCartItemById = async (req, res, next) => {
  try {
    const cartItems = await CartItem.findByPk(req.params.id, {
      include: {
        model: Product,
        include: ["productCategory"],
        attributes: ["id", "name", "price", "image"],
      },
    });

    return res.json({
      success: true,
      data: cartItems,
    });
  } catch (error) {
    next(error);
  }
};

const emptyCart = async (req, res, next) => {
  try {
    await CartItem.destroy({ where: { user_id: req.user.id } });

    return res.json({
      success: true,
      data: null,
      msg: "cart items deleted.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  editCart,
  deleteCart,
  getCartItems,
  getCartItemById,
  emptyCart,
};
