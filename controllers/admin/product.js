const { Op } = require("sequelize");
const Product = require("../../models/product");
const ProductCategory = require("../../models/productCategory");
const ProductIngrediant = require("../../models/productIngrediant");
const Store = require("../../models/store");
const StoreProduct = require("../../models/storeProduct");
const { getImage, getOffsetAndLimit } = require("../../lib/helper");
const Ingrediant = require("../../models/ingrediant");

// product apis

const getProduct = async (req, res, next) => {
  try {
    const { offset, limit, page } = getOffsetAndLimit(req?.query);
    const searchText = req?.query?.search;

    let where = {};
    if (searchText) {
      where = {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${searchText}%`,
            },
          },
        ],
      };
    }

    const { rows: products, count: total } = await Product.findAndCountAll({
      include: ["ingrediants", "productCategory"],
      where,
      offset,
      limit,
      distinct: true,
      order: [["updatedAt", "DESC"]],
    });

    if (products?.length) {
      for (const product of products) {
        product.dataValues.image = await getImage(
          process.env.AWS_BUCKET_NAME,
          product.image
        );
      }
    }

    return res.json({
      success: true,
      msg: "products",
      data: products,
      page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { id: req?.params?.id },
      include: [
        {
          model: Ingrediant,
          as: "ingrediants",
          attributes: ["id", "name"],
          through: {
            as: "productIngrediants",
            attributes: ["is_required"],
          },
        },
        "productCategory",
      ],
    });

    if (product?.dataValues?.image) {
      product.dataValues.image = await getImage(
        process.env.AWS_BUCKET_NAME,
        product.image
      );
    }

    if (product?.dataValues?.ingrediants?.length) {
      const required = [];
      const optional = [];
      product.dataValues.ingrediants.forEach((ingrediant) => {
        const obj = { label: ingrediant.name, value: ingrediant.id };
        if (ingrediant?.productIngrediants?.dataValues?.is_required) {
          required.push(obj);
        } else {
          optional.push(obj);
        }
      });
      product.dataValues = {
        ...product.dataValues,
        ingrediants: {
          required,
          optional,
        },
      };
    }

    if (!product) {
      throw new Error("Invalid product id .");
    }

    return res.json({ success: true, msg: "product", data: product });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    if (req.body.price) {
      req.body.price = JSON.parse(req.body.price);
    }
    if (req.body.ingrediants) {
      req.body.ingrediants = JSON.parse(req.body.ingrediants);
    }

    const {
      name,
      category_id,
      material_id,
      sub_category,
      price,
      label_color,
      ingrediants,
      spicy,
    } = req.body;
    let product,
      category,
      requiredIngrediants = [],
      optionalIngrediants = [];

    category = await ProductCategory.findByPk(category_id);

    if (!category) {
      throw new Error("Invalid product category provided.");
    }

    if (
      sub_category &&
      category.name.toLowerCase() === "pizza" &&
      ["PREMIUM", "CLASSIC"].indexOf(sub_category) === -1
    ) {
      throw new Error("Invalid pizza sub category provided.");
    }

    product = await Product.create({
      name,
      category_id,
      material_id,
      sub_category,
      price: Array.isArray(price) ? price : [price],
      label_color,
      image: req?.file?.key,
      spicy,
    });

    if (category.name.toLowerCase() === "pizza" && ingrediants) {
      if (ingrediants.required && ingrediants.required.length > 0) {
        requiredIngrediants = ingrediants.required.map((ing) => {
          return {
            product_id: product.id,
            ingrediant_id: ing,
            is_required: true,
          };
        });
      }

      if (ingrediants.optional && ingrediants.optional.length > 0) {
        optionalIngrediants = ingrediants.optional.map((ing) => {
          return {
            product_id: product.id,
            ingrediant_id: ing,
            is_required: false,
          };
        });
      }

      let productIngrediants = await ProductIngrediant.bulkCreate([
        ...requiredIngrediants,
        ...optionalIngrediants,
      ]);
    }

    const stores = await Store.findAll({ attributes: ["id"], raw: true });
    let storeProducts = stores.map((s) => {
      return {
        store_id: s.id,
        product_id: product.id,
        status: "enabled",
      };
    });

    await StoreProduct.bulkCreate(storeProducts);
    return res.json({ success: true, msg: "Product created.", data: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    if (req.body.price) {
      req.body.price = JSON.parse(req.body.price);
    }
    if (req.body.ingrediants) {
      req.body.ingrediants = JSON.parse(req.body.ingrediants);
    }
    if (req?.file?.key) {
      req.body.image = req?.file?.key;
    }

    const { sub_category, ingrediants } = req.body;
    let product,
      category,
      requiredIngrediants = [],
      optionalIngrediants = [];

    product = await Product.findByPk(req.params.id);

    if (!product) {
      throw new Error("Invalid product id");
    }

    category = await ProductCategory.findByPk(product.category_id);

    if (!category) {
      throw new Error("Invalid product category provided.");
    }

    if (
      sub_category &&
      category.name.toLowerCase() === "pizza" &&
      ["PREMIUM", "CLASSIC"].indexOf(sub_category) === -1
    ) {
      throw new Error("Invalid pizza sub category provided.");
    }

    if (category.name.toLowerCase() === "pizza" && ingrediants) {
      if (ingrediants.required && ingrediants.required.length > 0) {
        requiredIngrediants = ingrediants.required.map((ing) => {
          return {
            product_id: product.id,
            ingrediant_id: ing,
            is_required: true,
          };
        });
        await ProductIngrediant.destroy({
          where: { product_id: product.id, is_required: true },
        });
      }

      if (ingrediants.optional && ingrediants.optional.length > 0) {
        optionalIngrediants = ingrediants.optional.map((ing) => {
          return {
            product_id: product.id,
            ingrediant_id: ing,
            is_required: false,
          };
        });
        await ProductIngrediant.destroy({
          where: { product_id: product.id, is_required: false },
        });
      }

      let productIngrediants = await ProductIngrediant.bulkCreate([
        ...requiredIngrediants,
        ...optionalIngrediants,
      ]);
    }

    await product.update(req.body);
    return res.json({ success: true, msg: "Product updated.", data: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    let product = await Product.findByPk(req.params.id);

    if (!product) {
      throw new Error("Invalid product id provided.");
    }
    // TODO: DELETE product image from AWS

    await StoreProduct.destroy({ where: { product_id: product.id } });
    await ProductIngrediant.destroy({ where: { product_id: product.id } });
    await product.destroy();
    return res.json({ success: true, msg: "product deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProduct,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
