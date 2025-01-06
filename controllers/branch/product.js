const { Op } = require("sequelize");
const Product = require("../../models/product");
const { getImage, getOffsetAndLimit } = require("../../lib/helper");
const Store = require("../../models/store");
const StoreProduct = require("../../models/storeProduct");
const sequelize = require("../../config/db");
const ProductCategory = require("../../models/productCategory");

const getProduct = async (req, res, next) => {
  try {
    const { offset, limit, page } = getOffsetAndLimit(req?.query);
    const searchText = req?.query?.search;

    let where = {
      store_id: req?.user?.id,
    };
    if (searchText) {
      where = {
        [Op.or]: [
          {
            "$Product.name$": {
              [Op.iLike]: `%${searchText}%`,
            },
          },
        ],
      };
    }

    const { rows: products, count: total } = await StoreProduct.findAndCountAll(
      {
        where,
        include: [
          {
            model: Product,
            attributes: [
              "id",
              "name",
              "category_id",
              "sub_category",
              "price",
              "label_color",
              "image",
            ],
            nested: true,
            include: [
              {
                model: ProductCategory,
                as: "productCategory",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
        // attributes: [
        //   "id",
        //   "status",
        //   "updatedAt",
        //   [sequelize.col("Product.name"), "name"],
        //   [sequelize.col("Product.image"), "image"],
        //   [sequelize.col("Product.sub_category"), "sub_category"],
        //   [sequelize.col("Product.price"), "price"],
        //   [sequelize.col("Product.label_color"), "label_color"],
        //   // [sequelize.col("Product.productCategory.id"), "productCategory.id"],
        //   // [sequelize.col("Product.productCategory.name"), "productCategory.name"],
        // ],
        offset,
        limit,
        distinct: true,
        order: [["updatedAt", "DESC"]],
      }
    );

    const formatedResponse = [];
    for (const product of products) {
      const image = product?.Product?.image
        ? await getImage(process.env.AWS_BUCKET_NAME, product?.Product?.image)
        : null;
      formatedResponse.push({
        id: product.id,
        status: product.status,
        updatedAt: product.updatedAt,
        name: product?.Product?.name,
        image: image,
        sub_category: product?.Product?.sub_category,
        price: product?.Product?.price,
        label_color: product?.Product?.label_color,
        productCategory: {
          id: product?.Product?.productCategory.id,
          name: product?.Product?.productCategory.name,
        },
      });
    }

    return res.json({
      success: true,
      msg: "products",
      data: formatedResponse,
      page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await StoreProduct.findByPk(req.params.id);

    if (!product) {
      throw new Error("Invalid product id");
    }

    product.status = req.body.status ?? product.status;

    await product.update(req.body);
    return res.json({ success: true, msg: "Product updated.", data: product });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProduct,
  updateProduct,
};
