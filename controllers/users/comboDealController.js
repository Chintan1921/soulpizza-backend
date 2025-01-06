const ComboDeal = require("../../models/comboDeal");
const Product = require("../../models/product");
const Store = require("../../models/store");
const CartItem = require("../../models/cartItem");

const createComboDeal = async (req, res, next) => {
  try {
    const {
      product_id,
      store_id,
      deal_id,
      crust_type,
      size,
      gluten_free,
      ingrediants,
    } = req.body;

    // Validate product existence
    const product = await Product.findByPk(product_id);
    if (!product) throw new Error("Invalid product ID provided.");

    // Validate store existence
    const store = await Store.findByPk(store_id);
    if (!store) throw new Error("Invalid store ID provided.");

    // Create the combo deal
    const comboDeal = await ComboDeal.create({
      product_id,
      store_id,
      deal_id,
      crust_type,
      size,
      gluten_free,
      ingrediants,
    });

    return res.json({
      success: true,
      data: comboDeal,
    });
  } catch (error) {
    next(error);
  }
};

const getComboDeals = async (req, res, next) => {
  try {
    const comboDeals = await ComboDeal.findAll({
      include: [
        { model: Product, as: "product" },
        { model: Store, as: "store" },
      ],
    });

    return res.json({
      success: true,
      data: comboDeals,
    });
  } catch (error) {
    next(error);
  }
};

const updateComboDeal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deal_id, crust_type, size, gluten_free, ingrediants } = req.body;

    const comboDeal = await ComboDeal.findByPk(id);
    if (!comboDeal) throw new Error("Invalid combo deal ID provided.");

    comboDeal.deal_id = deal_id || comboDeal.deal_id;
    comboDeal.crust_type = crust_type || comboDeal.crust_type;
    comboDeal.size = size || comboDeal.size;
    comboDeal.gluten_free = gluten_free || comboDeal.gluten_free;
    comboDeal.ingrediants = ingrediants || comboDeal.ingrediants;

    await comboDeal.save();

    return res.json({
      success: true,
      data: comboDeal,
    });
  } catch (error) {
    next(error);
  }
};

const deleteComboDeal = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comboDeal = await ComboDeal.findByPk(id);
    if (!comboDeal) throw new Error("Invalid combo deal ID provided.");

    await comboDeal.destroy();

    return res.json({
      success: true,
      message: "Combo deal deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// const addToCartComboDeal = async (req, res) => {
//   try {
//     const { product_id, store_id, comboItems, deal_id } = req.body;

//     // Validate required fields
//     if (
//       !product_id ||
//       !store_id ||
//       !Array.isArray(comboItems) ||
//       comboItems.length === 0
//     ) {
//       return res.status(400).json({
//         error:
//           "Missing or invalid required fields: product_id, store_id, or comboItems.",
//       });
//     }

//     // Validate store
//     const store = await Store.findByPk(store_id);
//     if (!store) {
//       return res
//         .status(404)
//         .json({ error: `Store with ID ${store_id} not found.` });
//     }

//     // Process each combo item
//     for (const item of comboItems) {
//       const product = await Product.findByPk(item);
//       if (!product) {
//         return res.status(404).json({
//           error: `Product with ID ${item} not found.`,
//         });
//       }

//       // Create ComboDeal entry
//       try {
//         await ComboDeal.create({
//           product_id: product.id,
//           store_id,
//           deal_id: deal_id || null, // deal_id is optional
//           crust_type: product.crust_type || null,
//           size: product.size || null,
//           gluten_free: product.gluten_free || false,
//           ingrediants: product.ingrediants || {},
//         });
//       } catch (comboError) {
//         console.error(
//           `Error creating ComboDeal for product ID ${item}:`,
//           comboError
//         );
//         return res.status(500).json({
//           error: `Failed to create ComboDeal for product ID ${item}.`,
//         });
//       }
//     }

//     // Create cart item
//     try {
//       const newCartItem = await CartItem.create({
//         user_id: req.user.id, // Assuming user ID is available in req.user
//         product_id,
//         store_id,
//         deal_id: deal_id || null,
//         comboItems,
//       });

//       return res.status(200).json({
//         message: "ComboDeal created and CartItems updated successfully.",
//         cartItem: {
//           ...newCartItem.toJSON(),
//           deal_id, // Explicitly include deal_id
//         },
//       });
//     } catch (cartError) {
//       console.error("Error creating CartItem:", cartError);
//       return res.status(500).json({ error: "Failed to create CartItem." });
//     }
//   } catch (error) {
//     console.error("Error processing addToCartComboDeal request:", error);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// };

const addToCartComboDeal = async (req, res) => {
  try {
    const { product_id, store_id, comboItems, deal_id, quantity } = req.body;

    // Validate required fields
    if (
      !product_id ||
      !store_id ||
      !Array.isArray(comboItems) ||
      comboItems.length === 0 ||
      typeof quantity !== "number" || // Check for valid quantity
      quantity <= 0 // Check that quantity is positive
    ) {
      return res.status(400).json({
        error:
          "Missing or invalid required fields: product_id, store_id, comboItems, or quantity.",
      });
    }

    // Validate store
    const store = await Store.findByPk(store_id);
    if (!store) {
      return res
        .status(404)
        .json({ error: `Store with ID ${store_id} not found.` });
    }

    // Process each combo item
    for (const item of comboItems) {
      const product = await Product.findByPk(item);
      if (!product) {
        return res.status(404).json({
          error: `Product with ID ${item} not found.`,
        });
      }

      // Create ComboDeal entry
      try {
        await ComboDeal.create({
          product_id: product.id,
          store_id,
          deal_id: deal_id || null, // deal_id is optional
          crust_type: product.crust_type || null,
          size: product.size || null,
          gluten_free: product.gluten_free || false,
          ingrediants: product.ingrediants || {},
        });
      } catch (comboError) {
        console.error(
          `Error creating ComboDeal for product ID ${item}:`,
          comboError
        );
        return res.status(500).json({
          error: `Failed to create ComboDeal for product ID ${item}.`,
        });
      }
    }

    // Create cart item
    try {
      const newCartItem = await CartItem.create({
        user_id: req.user.id, // Assuming user ID is available in req.user
        product_id,
        store_id,
        deal_id: deal_id || null,
        comboItems,
        quantity: quantity, // Include quantity in the cart item
      });

      return res.status(200).json({
        message: "ComboDeal created and CartItems updated successfully.",
        cartItem: {
          ...newCartItem.toJSON(),
          deal_id, // Explicitly include deal_id
          quantity, // Include the quantity in the response
        },
      });
    } catch (cartError) {
      console.error("Error creating CartItem:", cartError);
      return res.status(500).json({ error: "Failed to create CartItem." });
    }
  } catch (error) {
    console.error("Error processing addToCartComboDeal request:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
module.exports = addToCartComboDeal;

module.exports = {
  createComboDeal,
  getComboDeals,
  updateComboDeal,
  deleteComboDeal,
  addToCartComboDeal,
};
