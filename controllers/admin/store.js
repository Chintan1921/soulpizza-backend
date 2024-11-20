const Store = require("../../models/store");
const Product = require("../../models/product");
const ProductCategory = require("../../models/productCategory");
const StoreProduct = require("../../models/storeProduct");
const StoreCategory = require("../../models/storeCategory");
const { getOffsetAndLimit } = require("../../lib/helper");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { StateLite, CityLite } = require("country-state-city-js");

const getStores = async (req, res, next) => {
  try {
    const { offset, limit, page } = getOffsetAndLimit(req?.query);

    const searchText = req?.query?.search;
    const city = req?.query?.city;
    const country = req?.query?.country;

    let where = {};
    if (searchText) {
      where = {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${searchText}%`,
            },
          },
          {
            owner_name: {
              [Op.iLike]: `%${searchText}%`,
            },
          },
        ],
      };
    }

    if (city && country) {
      where.city = { [Op.eq]: city };
      where.country = { [Op.eq]: country };
    }

    let { rows: stores, count: total } = await Store.findAndCountAll({
      attributes: { exclude: ["password"] },
      where,
      offset,
      limit,
    });

    return res.json({
      success: true,
      msg: "Stores fetched successfully",
      data: stores,
      page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

const getStore = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req?.params?.id, {
      attributes: { exclude: ["password"] },
    });

    if (!store) {
      throw new Error("Invalid store id provided.");
    }
    return res.json({
      success: true,
      msg: "Store fetched successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    let emailExists = await Store.findOne({
      where: {
        email: {
          [Op.iLike]: req.body.email,
        },
      },
    });

    if (emailExists) {
      throw new Error("Email already exists.");
    }

    req.body.password = await bcrypt.hash(req.body.password, 8);

    const store = await Store.create(req.body);
    delete store?.dataValues?.password;
    let categories = await ProductCategory.findAll({});
    let insertCategories = categories.map((category) => {
      return {
        category_id: category.id,
        store_id: store.id,
        status: "enabled",
      };
    });
    let storeCategories = await StoreCategory.bulkCreate([...insertCategories]);

    let prodcts = await Product.findAll({});
    let insertProducts = prodcts.map((product) => {
      return {
        product_id: product.id,
        store_id: store.id,
        status: "enabled",
      };
    });
    let storeProducts = await StoreProduct.bulkCreate([...insertProducts]);

    return res.json({
      success: true,
      msg: "Store created successfully",
      data: await Store.findByPk(store.id, {
        include: [StoreCategory, StoreProduct],
      }),
    });
  } catch (error) {
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  try {
    let store = await Store.findByPk(req.params.id);

    if (!store) {
      throw new Error("Invalid store id provided.");
    }
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 8);
    }
    await store.update(req.body);
    return res.json({
      success: true,
      msg: "Store updated successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

const deleteStore = async (req, res, next) => {
  try {
    let store = await Store.findByPk(req.params.id);

    if (!store) {
      throw new Error("Invalid store id provided.");
    }
    await store.destroy();
    return res.json({ success: true, msg: "Store deleted successfully" });
  } catch (error) {
    next(error);
  }
};

const getCities = (req, res, next) => {
  let country = req?.query?.country;

  if (!country || !["AU", "NZ"].includes(country)) {
    throw new Error("Invalid country provided.");
  }

  const cities = CityLite(country, req.query?.state);
  return res.json({
    success: true,
    data: cities,
  });
};

const getStates = (req, res, next) => {
  let iso = req?.query?.country;

  if (!iso || !["AU", "NZ"].includes(iso)) {
    throw new Error("Invalid country provided.");
  }

  const states = StateLite(iso);
  return res.json({
    success: true,
    data: states,
  });
};

module.exports = {
  getStores,
  getStore,
  getCities,
  getStates,
  createStore,
  updateStore,
  deleteStore,
};
