const Store = require("../../models/store");
const bcrypt = require("bcrypt");
const { StateLite, CityLite } = require("country-state-city-js");

const updateStore = async (req, res, next) => {
  try {
    let store = await Store.findByPk(req.user.id);

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
  updateStore,
  getCities,
  getStates,
};
