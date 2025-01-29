const Order = require("../../models/order");
const { getOffsetAndLimit } = require("../../lib/helper");
const { Op } = require("sequelize");
const moment = require("moment");

const OrderItem = require("../../models/orderItem");
const Product = require("../../models/product");

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
    where.store_id = req.user.id;

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

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        // Wait for all orderItems to be processed
        order.orderItems = await Promise.all(
          order.orderItems.map(async (orderItem) => {
            // Initialize arrays
            orderItem.dataValues.requiredIngrediants = [];
            orderItem.dataValues.customIngrediants = [];

            // Process ingredients
            orderItem.product.ingrediants.forEach((ingrediant) => {
              if (orderItem?.ingrediants?.required.includes(ingrediant.id)) {
                orderItem.dataValues.requiredIngrediants.push(ingrediant);
              }

              if (orderItem?.ingrediants?.custom.includes(ingrediant.id)) {
                orderItem.dataValues.customIngrediants.push(ingrediant);
              }
            });

            // Initialize combo items array
            orderItem.dataValues.comboDealItems = [];

            // Process combo items
            if (
              orderItem?.dataValues?.comboItems &&
              orderItem?.dataValues?.comboItems?.length > 0
            ) {
              const comboProducts = await Product.findAll({
                where: { id: orderItem?.dataValues.comboItems },
              });
              orderItem.dataValues.comboDealItems = comboProducts;
            }

            return orderItem; // Important: return the modified orderItem
          })
        );

        return order; // Return the modified order
      })
    );

    res.send({
      success: true,
      msg: "Orders",
      data: updatedOrders,
      page,
      total,
    });
    return;
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    let order = await Order.findByPk(req.params.id);

    if (!order) {
      throw new Error("Invalid order id provided.");
    }

    if (order.store_id !== req.user.id) {
      throw new Error("Order does not belong to your store.");
    }
    order.status = req.body?.status ?? order.status;
    order.is_printed = req.body?.is_printed ?? order.is_printed;

    await order.save();

    return res.json({
      success: true,
      data: order,
      msg: "Order status updated.",
    });
  } catch (error) {
    next(error);
  }
};

const updatePickupTime = async (req, res, next) => {
  try {
    const { additionalTime } = req.body;

    // Validate additionalTime
    if (!additionalTime) {
      throw new Error("Additional time is required.");
    }

    // Find the order by ID
    let order = await Order.findByPk(req.params.id);

    if (!order) {
      throw new Error("Invalid order ID provided.");
    }

    // Check if the order belongs to the authenticated user's store
    if (order.store_id !== req.user.id) {
      throw new Error("Order does not belong to your store.");
    }

    // Ensure the pickup time is correctly parsed using moment
    const currentPickupTime = moment(order.pickup_time);

    // Check if the pickup_time was properly parsed
    if (!currentPickupTime.isValid()) {
      throw new Error("Invalid pickup time format.");
    }

    // Add the additional time (in minutes) to the current pickup time
    const updatedPickupTime = currentPickupTime.add(additionalTime, "minutes");

    // Update the order's pickup_time with the new time
    order.pickup_time = updatedPickupTime.format("YYYY-MM-DD HH:mm:ss.SSSZ"); // Adjust formatting if needed

    // Save the updated order
    await order.save();

    return res.json({
      success: true,
      data: order,
      msg: "Pickup time updated successfully.",
    });
  } catch (error) {
    next(error);
  }
};

const getNewOrders = async (req, res, next) => {
  try {
    const { offset, limit, page } = getOffsetAndLimit(req?.query);

    const where = {
      is_printed: false,
      status: "in-progress",
      store_id: req.user.id,
    };

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
      order: [["updatedAt", "DESC"]],
    });

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        // Wait for all orderItems to be processed
        order.orderItems = await Promise.all(
          order.orderItems.map(async (orderItem) => {
            // Initialize arrays
            orderItem.dataValues.requiredIngrediants = [];
            orderItem.dataValues.customIngrediants = [];

            // Process ingredients
            orderItem.product.ingrediants.forEach((ingrediant) => {
              if (orderItem?.ingrediants?.required.includes(ingrediant.id)) {
                orderItem.dataValues.requiredIngrediants.push(ingrediant);
              }

              if (orderItem?.ingrediants?.custom.includes(ingrediant.id)) {
                orderItem.dataValues.customIngrediants.push(ingrediant);
              }
            });

            // Initialize combo items array
            orderItem.dataValues.comboDealItems = [];

            // Process combo items
            if (
              orderItem?.dataValues?.comboItems &&
              orderItem?.dataValues?.comboItems?.length > 0
            ) {
              const comboProducts = await Product.findAll({
                where: { id: orderItem?.dataValues.comboItems },
              });
              orderItem.dataValues.comboDealItems = comboProducts;
            }

            return orderItem; // Important: return the modified orderItem
          })
        );

        return order; // Return the modified order
      })
    );

    res.send({ success: true, msg: "New Orders", data: updatedOrders });
    return;
  } catch (error) {
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
  getOrders,
  getOrderDetail,
  updateOrder,
  getNewOrders,
  updatePickupTime,
};
