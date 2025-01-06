const { getOffsetAndLimit } = require("../../lib/helper");
const Ingrediant = require("../../models/ingrediant");
const { Op } = require("sequelize");
const ProductIngrediant = require("../../models/productIngrediant");

// Ingrediants apis
const getIngrediants = async (req, res, next) => {
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

    const { rows: ingrediants, count: total } =
      await Ingrediant.findAndCountAll({
        where,
        offset,
        limit: req?.query?.limit ? limit : null,
        order: [["name", "ASC"]],
      });

    return res.json({
      success: true,
      msg: "ingrediants",
      data: ingrediants,
      page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

const createIngrediant = async (req, res, next) => {
  try {
    let ingrediant = await Ingrediant.findOne({
      where: {
        name: {
          [Op.iLike]: req.body.name,
        },
      },
    });

    if (ingrediant !== null) {
      throw new Error("Incrediant already exists");
    }

    ingrediant = await Ingrediant.create({
      name: req.body.name,
      price: req.body.price,
      status: req.body?.status || "enabled",
      category: req.body.category,
    });

    return res.json({
      success: true,
      msg: "Incrediant created.",
      data: ingrediant,
    });
  } catch (error) {
    next(error);
  }
};

const updateIngrediant = async (req, res, next) => {
  try {
    let ingrediant = await Ingrediant.findByPk(req.params.id);

    if (!ingrediant) {
      throw new Error("Invalid Incrediant id provided.");
    }

    ingrediant.name = req.body.name ?? ingrediant.name;
    ingrediant.price = req.body.price ?? ingrediant.price;
    ingrediant.status = req.body.status ?? ingrediant.status;
    ingrediant.category = req.body.category ?? ingrediant.category;

    await ingrediant.save();
    return res.json({
      success: true,
      msg: "Incrediant updated.",
      data: ingrediant,
    });
  } catch (error) {
    next(error);
  }
};

const deleteIngrediant = async (req, res, next) => {
  try {
    let ingrediant = await Ingrediant.findByPk(req.params.id);

    if (!ingrediant) {
      throw new Error("Invalid Incrediant id provided.");
    }

    await ProductIngrediant.destroy({
      where: { ingrediant_id: req.params.id },
    });
    await ingrediant.destroy();
    return res.json({ success: true, msg: "Incrediant deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  //Ingrediants apis

  getIngrediants,
  createIngrediant,
  updateIngrediant,
  deleteIngrediant,
};
