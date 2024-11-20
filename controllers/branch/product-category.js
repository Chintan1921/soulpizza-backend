const sequelize = require("../../config/db");
const { getImage } = require("../../lib/helper");
const ProductCategory = require("../../models/productCategory");
const Store = require("../../models/store");
const StoreCategory = require("../../models/storeCategory");

// Product categories apis

const getProductCategory = async (req, res, next) => {
  try {
    const storeId = req.user.id;

    const categories = await StoreCategory.findAll({
      where: {
        store_id: storeId,
      },
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
        "status",
        "updatedAt",
        [sequelize.col("productCategory.name"), "name"],
        [sequelize.col("productCategory.image"), "image"],
      ],
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
      msg: "Product categories.",
      data: categories,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const updateProductCategory = async (req, res, next) => {
  try {
    let productCategory = await StoreCategory.findByPk(req.params.id);

    if (!productCategory) {
      throw new Error("Invalid product category id provided.");
    }

    productCategory.status = req.body.status ?? productCategory.status;
    await productCategory.save();
    return res.json({
      success: true,
      msg: "Product category updated.",
      data: productCategory,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductCategory,
  updateProductCategory,
};
