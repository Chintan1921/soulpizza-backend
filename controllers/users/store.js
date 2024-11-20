const Store = require("../../models/store");
const { Op } = require("sequelize");
const StoreCategory = require("../../models/storeCategory");
const ProductCategory = require("../../models/productCategory");
const Product = require("../../models/product");
const StoreProduct = require("../../models/storeProduct");
const { StateLite, CityLite } = require("country-state-city-js");
const sequelize = require("../../config/db");
const { getImage } = require("../../lib/helper");

const getStores = async (req, res, next) => {
  try {
    const page = req?.query?.page || 1;
    const limit = req?.query?.limit || 10;
    const offset = (page - 1) * limit;

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
  where.status = "active";

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

const getEnabledProducts = async (req, res, next) => {
  try {
    const storeCategory = await StoreCategory.findByPk(
      req.params.storeCategoryId
    );

    const products = await Product.findAll({
      where: { category_id: storeCategory.category_id },
      attributes: ["id"],
      raw: true,
    });

    let where = {
      store_id: req.params.id,
      [Op.or]: {
        product_id: products.map((p) => p.id),
      },
    };

    if (!req.query.all) {
      where.status = "enabled";
    }

    const storeProducts = await StoreProduct.findAll({
      where,
      include: Product,
    });

    return res.json({
      success: true,
      msg: "enabled prodcts",
      data: storeProducts,
    });
  } catch (error) {
    next(error);
  }
};

const getEnabledCategories = async (req, res, next) => {
  try {
    let where = {
      store_id: req.params.id,
    };

    if (!req.query.all) {
      where.status = "enabled";
    }

    const categories = await StoreCategory.findAll({
      where,
      include: [
        {
          model: ProductCategory,
          as: "productCategory",
          attributes: [],
          nested: true,
        },
      ],
      attributes: [
        "id",
        "category_id",
        "updatedAt",
        [sequelize.col("productCategory.name"), "name"],
        [sequelize.col("productCategory.image"), "image"],
      ],
      order: [["id", "ASC"]],
    });

    if (categories?.length) {
      for (const pc of categories) {
        pc.dataValues.image = await getImage(
          process.env.AWS_BUCKET_NAME,
          pc.dataValues.image
        );
      }
    }

    return res.json({
      success: true,
      msg: "enabled categories",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const getCities = (req, res, next) => {
  console.log("cities")
  let country = req?.query?.country;

  if (!country || !["AU", "NZ"].includes(country)) {
    throw new Error("Invalid country provided.");
  }

  let cities = [];

  if (!req?.query?.state) {
    const states = StateLite(country, { cities: true });
    states.forEach((state) => {
      cities = cities.concat(state.cities);
    });
  } else {
    cities = CityLite(country, req.query?.state);
  }

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
  getStore,
  getStores,
  getEnabledProducts,
  getEnabledCategories,
  getCities,
  getStates,
};
