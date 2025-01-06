const { getImage } = require("../../lib/helper");
const ProductCategory = require("../../models/productCategory");
const Store = require("../../models/store");
const StoreCategory = require("../../models/storeCategory");

// Product categories apis

const getProductCategory = async (req, res, next) => {
  try {
    let where = {};

    if (req.params?.fieldSet === "active") {
      where = {
        status: "enabled",
      };
    }

    let productCategory = await ProductCategory.findAll({ where });

    if (productCategory?.length) {
      for (const pc of productCategory) {
        pc.dataValues.image = await getImage(
          process.env.AWS_BUCKET_NAME,
          pc.image
        );
      }
    }

    return res.json({
      success: true,
      msg: "Product categories.",
      data: productCategory,
    });
  } catch (error) {
    next(error);
  }
};

const createProductCategory = async (req, res, next) => {
  try {
    let productCategory = await ProductCategory.findOne({
      where: { name: req.body.name },
    });

    if (productCategory !== null) {
      throw new Error("Product category already exists");
    }
    productCategory = await ProductCategory.create({
      name: req.body.name,
      image: req.file.key,
      status: req.body?.status || "enabled",
    });

    const stores = await Store.findAll({ attributes: ["id"], raw: true });
    let storeCategories = stores.map((s) => {
      return {
        store_id: s.id,
        category_id: productCategory.id,
        status: "enabled",
      };
    });

    await StoreCategory.bulkCreate(storeCategories);

    return res.json({
      success: true,
      msg: "Product category created.",
      data: productCategory,
    });
  } catch (error) {
    next(error);
  }
};

const updateProductCategory = async (req, res, next) => {
  try {
    let productCategory = await ProductCategory.findByPk(req.params.id);

    if (!productCategory) {
      throw new Error("Invalid product category id provided.");
    }
    const updateStoreCategories = productCategory.status !== req.body?.status;

    productCategory.name = req.body.name ?? productCategory.name;
    productCategory.image = req?.file?.key ?? productCategory.image;
    productCategory.status = req.body.status ?? productCategory.status;
    await productCategory.save();

    if (updateStoreCategories) {
      await StoreCategory.update(
        { status: productCategory.status },
        { where: { category_id: productCategory.id } }
      );
    }

    return res.json({
      success: true,
      msg: "Product category updated.",
      data: productCategory,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProductCategory = async (req, res, next) => {
  try {
    let productCategory = await ProductCategory.findByPk(req.params.id);

    if (!productCategory) {
      throw new Error("Invalid product category id provided.");
    }
    // TODO: DELETE category image from AWS
    await productCategory.destroy();
    return res.json({ success: true, msg: "Product category deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductCategory,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
};
