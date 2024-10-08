const Order = require("../../models/order");
const { getOffsetAndLimit } = require("../../lib/helper");
const { Op } = require("sequelize");

const OrderItem = require("../../models/orderItem");
const Product = require("../../models/product");

const getOrders = async (req, res, next) => {
  try {
    const { offset, limit, page } = getOffsetAndLimit(req?.query);
    const searchId = req?.query?.search;
    const storeId = req?.query?.store_id;
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

    if (storeId) {
      where.store_id = storeId;
    }

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

    const updatedOrders = orders.map((order) => {
      order.orderItems = order.orderItems.map((orderItem) => {
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
      });

      return order;
    });

    res.send({ success: true, msg: "Oders", data: updatedOrders, page, total });
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

const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) {
      throw new Error("Order not found.");
    }

    order.status = req.body?.status ?? order.status;
    order.is_printed = req.body?.is_printed ?? order.is_printed;

    await order.save();

    return res.json({
      success: true,
      msg: "Order updated successfuly.",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderDetail,
  updateOrder,
};
