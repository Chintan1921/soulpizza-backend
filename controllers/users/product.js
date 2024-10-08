const { Op } = require("sequelize");
const { getImage } = require("../../lib/helper");
const Product = require("../../models/product");
const Ingrediant = require("../../models/ingrediant");
const StoreProduct = require("../../models/storeProduct");
const ProductCategory = require("../../models/productCategory");
const ProductMaterial = require("../../models/material");
const Favorite = require("../../models/favorite");

// product apis

const getProduct = async (req, res, next) => {
  try {
    const searchText = req?.query?.search;

    let where = {};

    if (!req.query.all) {
      where.status = "enabled";
    }

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

    if (req.query.store) {
      where.store_id = req.query.store;
    }

    let productWhere = {};

    if (req.query.category) {
      productWhere.category_id = req.query.category;
    }

    const storeProduct = await StoreProduct.findAll({
      where,
      include: [
        {
          model: Product,
          where: productWhere,
          attributes: [
            "id",
            "name",
            "category_id",
            "material_id",
            "sub_category",
            "price",
            "label_color",
            "image",
          ],
          nested: true,
          include: [
            {
              model: Ingrediant,
              as: "ingrediants",
              attributes: ["id", "name", "category", "price"],
              through: {
                as: "productIngrediants",
                attributes: [],
                where: { is_required: true },
              },
            },
            {
              model: ProductCategory,
              as: "productCategory",
              attributes: ["id", "name"],
            },
            {
              model: ProductMaterial,
              as: "productMaterial",
              attributes: ["id", "material"],
            }
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
 
    const formatedResponse = [];
    for (const product of storeProduct) {
      const image = product?.Product?.image
        ? await getImage(process.env.AWS_BUCKET_NAME, product?.Product?.image)
        : null;

        
      const where = {
        user_id: req.query?.user_id,
        store_product_id: product?.Product?.id,
      };

      const favorite = req.query?.user_id && req.query?.user_id !== "undefined" ? await Favorite.findOne({ where: where}) : null;

      formatedResponse.push({
        id: product?.Product?.id,
        updatedAt: product?.updatedAt,
        createdAt: product?.createdAt,
        name: product?.Product?.name,
        category_id: product?.Product?.category_id,
        material_id: product?.Product?.material_id,
        sub_category: product?.Product?.sub_category,
        price: product?.Product?.price,
        label_color: product?.Product?.label_color,
        image: image,
        ingrediants: product?.Product?.ingrediants,
        productCategory: {
          id: product?.Product?.productCategory.id,
          name: product?.Product?.productCategory.name,
        },
        productMaterial: product?.Product?.productMaterial ? {
          id: product?.Product?.productMaterial.id,
          material: product?.Product?.productMaterial.material,
        } : null,
        favorite: favorite ? true : false,
      });
    }

    return res.json({
      success: true,
      msg: "products",
      data: formatedResponse,
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
          attributes: ["id", "name", "category", "price"],
          through: {
            as: "productIngrediants",
            attributes: ["is_required"],
          },
        },
        "productCategory",
      ],
    });

    if (!product) {
      throw new Error("Invalid product id .");
    }

    if (product?.dataValues?.image) {
      product.dataValues.image = await getImage(
        process.env.AWS_BUCKET_NAME,
        product.image
      );
    }

    const where = {
      user_id: req?.user?.id,
      store_product_id: product?.dataValues?.id,
    };

    const favorite = req?.user?.id ? await Favorite.findOne({ where: where }) : null;

    product.dataValues.favorite = favorite ? true : false;

    if (product?.dataValues?.ingrediants?.length) {
      const required = [];
      const optional = [];
      product.dataValues.ingrediants.forEach((ingrediant) => {
        const obj = {
          id: ingrediant.id,
          name: ingrediant.name,
          price: ingrediant.price,
          category: ingrediant.category,
        };
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

    return res.json({ success: true, msg: "product", data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProduct,
  getProductById,
};
