const Material = require("../../models/material");

// Material apis

const getMaterials = async (req, res, next) => {
  try {
    let materials = await Material.findAll({
      order: [["id", "ASC"]]
    });

    return res.send({ success: true, msg: "Materials", data: materials });
  } catch (error) {
    next(error);
  }
};

const addMaterial = async (req, res, next) => {
  try {
    let material = await Material.findOne({
      where: { material: req.body.material },
    });

    if (material !== null) {
      throw new Error("Subcategory already exists");
    }
    material = await Material.create({
      material: req.body.material,
    });

    return res.json({
      success: true,
      msg: "Subcategory created.",
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    let material = await Material.findByPk(req.params.id);

    if (!material) {
      throw new Error("Invalid product subcategory id provided.");
    }

    material.material = req.body.material ?? material.material;
    await material.save();

    return res.json({
      success: true,
      msg: "Product subcategory updated.",
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    let material = await Material.findByPk(req.params.id);

    if (!material) {
      throw new Error("Invalid product subcategory id provided.");
    }
    // TODO: DELETE category image from AWS
    await material.destroy();
    return res.json({ success: true, msg: "Product subcategory deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaterials,
  addMaterial,
  updateMaterial,
  deleteMaterial,
};
