const Order = require("../../models/order");
const CartItem = require("../../models/cartItem");
const Product = require("../../models/product");
const Address = require("../../models/address");
const OrderItem = require("../../models/orderItem");
const Ingrediant = require("../../models/ingrediant");
const ProductIngrediant = require("../../models/productIngrediant");
const {
  getOffsetAndLimit,
  getImage,
  sendOrderConfirmationEmail,
} = require("../../lib/helper");
const dayjs = require("dayjs");

const placeOrder = async (req, res, next) => {
  try {
    let address,
      country,
      total = 0,
      orderItems = [];

    const { type, discount, pickup_time, delivery_time } = req.body;
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

    if (!cartItems) {
      throw new Error("Your cart is empty.");
    }

    const store = cartItems[0]?.store;
    country = store.country;

    if (type === "delivery") {
      if (!store.delivery_options?.delivery) {
        throw new Error("Delivery option is not available for this store.");
      }

      total += store.delivery_charge;
      const addressObj = await Address.findByPk(req.body?.address);

      if (!addressObj || addressObj.user_id !== req.user.id) {
        throw new Error("Address does not belong to user.");
      }

      address = `${req.user.name}, ${addressObj.street}, ${addressObj.city}, ${addressObj.state}, ${addressObj.country}. ${addressObj.zip} , ${addressObj.specialInstruction}`;
    } else if (type === "pickup") {
      if (!store.delivery_options?.pickup) {
        throw new Error("Pickup option is not available for this store.");
      }
    }
    const currentDate = new Date();
    const defaultPickupTime = req?.body?.pickup_time;
    console.log(req.body);
    const recentOrders = await Order.findAll({
      where: { store_id: req.body?.store_id },
      order: [["createdAt", "DESC"]],
      limit: 3,
    });

    // Only add time if there are at least three "in-progress" orders
    const shouldAddTime =
      recentOrders.length === 3 &&
      recentOrders.every((order) => order.status === "in-progress");
    // Adjust the pickup time if needed
    const finalPickupTime = shouldAddTime
      ? new Date(new Date(pickup_time).getTime() + 1 * 60 * 1000) // Adds 10 minutes if the last three are "in-progress"
      : pickup_time;
    console.log(shouldAddTime, "should time");

    const adjustedDefaultPickupTime = shouldAddTime
      ? new Date(new Date(defaultPickupTime).getTime() + 1 * 60 * 1000) // Adds 10 minutes if condition is met
      : defaultPickupTime;

    let orderData = {
      user_id: req.user.id,
      store_id: store.id,
      customer_name: req.user.name,
      customer_phone: req.user.mobile,
      address,
      status: "in-progress",
      type,
      // pickup_time: type === "pickup" ? req?.body?.pickup_time : defaultPickupTime,
      // pickup_time: type === "pickup" ? finalPickupTime : defaultPickupTime,
      pickup_time:
        type === "pickup" ? finalPickupTime : adjustedDefaultPickupTime,

      delivery_charge: type === "delivery" ? store.delivery_charge : null,
      discount,
      payment_type: req.body.payment_type,
    };

    orderData.gluten_free_price = store?.gluten_free_price || {};
    console.log(req.user.name, "user name");
    console.log(req.user.mobile, "Phone number");
    console.log(orderData);
    let order = await Order.create(orderData);
    console.log(order.status, "delivery timeeeee");
    cartItems.forEach((item) => {
      let itemData = {
          store_id: store.id,
          user_id: req.user.id,
          product_id: item.product_id,
          order_id: order.id,
          size: item?.size,
          crust_type: item?.crust_type,
          gluten_free: item?.gluten_free,
          quantity: item?.quantity,
          ingrediants: item?.ingrediants,
          notes: item?.notes,
          name: item.product.name,
          createdAt: order.createdAt,
        },
        product = item.product,
        category = product?.productCategory?.name,
        unitPrice = 0,
        price;

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
        if (item?.gluten_free && orderData?.gluten_free_price) {
          unitPrice += parseFloat(orderData.gluten_free_price[item.size] ?? 0);
        }
        //check ingrediants and include price of custom ingrediants
        let defaultIngrediants = 0;
        if (item.ingrediants?.custom?.length > 0) {
          product.ingrediants.forEach((ingrediant) => {
            ingrediant.is_required && defaultIngrediants++;
          });

          const removedRequiredIngrediants =
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
      total += unitPrice * item.quantity;
      itemData.price = unitPrice;
      orderItems.push(itemData);
    });
    await OrderItem.bulkCreate(orderItems);
    // await CartItem.destroy({
    //   where: { user_id: req.user.id },
    // });
    orderData.amount = total;
    orderData.tax = total - total / ((store.tax + 100) / 100);
    await order.update(orderData);
    await sendOrderConfirmationEmail(req.user.email, "Order Confirmation", {
      orderData,
      orderItems,
      id: order.id,
      createdAt: order.createdAt,
    });

    return res.json({
      success: true,
      data: {
        order: { ...orderData, orderItems },
        adjustedPickupTime: finalPickupTime,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { offset, limit, page } = getOffsetAndLimit(req?.query);
    const searchId = req?.query?.search;

    let where = {};

    if (searchId) {
      where = {
        [Op.or]: [
          {
            id: searchId,
          },
        ],
      };
    }

    where.user_id = req.user.id;

    const { rows: orders, count: total } = await Order.findAndCountAll({
      include: [
        "user",
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              include: ["ingrediants"],
            },
          ],
        },
      ],
      where,
      offset,
      limit,
      distinct: true,
      order: [["updatedAt", "DESC"]],
    });

    for (const order of orders) {
      for (const orderItem of order.orderItems) {
        orderItem.dataValues.requiredIngrediants = [];
        orderItem.dataValues.customIngrediants = [];

        orderItem.product.dataValues.image = await getImage(
          process.env.AWS_BUCKET_NAME,
          orderItem.product.dataValues.image
        );
        orderItem.product.ingrediants.forEach((ingrediant) => {
          if (orderItem?.ingrediants?.required.includes(ingrediant.id)) {
            orderItem.dataValues.requiredIngrediants.push(ingrediant);
          }

          if (orderItem?.ingrediants?.custom.includes(ingrediant.id)) {
            orderItem.dataValues.customIngrediants.push(ingrediant);
          }
        });
      }
    }

    res.send({ success: true, msg: "Oders", data: orders, page, total });
    return;
  } catch (error) {
    next(error);
  }
};

const deliveryTimeCheck = async (req, res, next) => {
  try {
    const storeId = req?.body?.store_id; // This should retrieve storeId from the request body.
    console.log("Store ID:", storeId); // Log to confirm it is being passed correctly.

    const requestedPickupTime = req.body.pickupTime;

    // Fetch recent orders to check the store's current status
    const recentOrders = await Order.findAll({
      where: { store_id: storeId },
      order: [["createdAt", "DESC"]],
      limit: 3,
    });

    // Check if store is busy by verifying if the last three orders are "in-progress"
    const shouldAddTime =
      recentOrders.length === 3 &&
      recentOrders.every((order) => order.status === "in-progress");

    // Calculate the adjusted pickup time based on store status
    const adjustedPickupTime = shouldAddTime
      ? new Date(new Date(requestedPickupTime).getTime() + 1 * 60 * 1000)
      : requestedPickupTime;

    res.json({
      success: true,
      adjustedPickupTime,
      isBusy: shouldAddTime,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getOrderDetail = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      include: [
        "user",
        {
          model: OrderItem,
          as: "orderItems",
          include: [
            {
              model: Product,
              as: "product",
              include: ["ingrediants"],
            },
          ],
        },
      ],
    });

    for (const orderItem of order.orderItems) {
      orderItem.dataValues.requiredIngrediants = [];
      orderItem.dataValues.customIngrediants = [];
      orderItem.product.dataValues.image = await getImage(
        process.env.AWS_BUCKET_NAME,
        orderItem.product.dataValues.image
      );
      orderItem.product.ingrediants.forEach((ingrediant) => {
        if (orderItem?.ingrediants?.required.includes(ingrediant.id)) {
          orderItem.dataValues.requiredIngrediants.push(ingrediant);
        }

        if (orderItem?.ingrediants?.custom.includes(ingrediant.id)) {
          orderItem.dataValues.customIngrediants.push(ingrediant);
        }
      });
    }

    res.send({ success: true, msg: "Oders", data: order });
    return;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderDetail,
  deliveryTimeCheck,
};
