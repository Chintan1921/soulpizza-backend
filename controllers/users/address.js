const Address = require("../../models/address");

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.findAll({
      where: { user_id: req.user.id },
    });

    return res.json({
      success: true,
      data: addresses,
      msg: "address",
    });
  } catch (error) {
    next(error);
  }
};

const getAddressById = async (req, res, next) => {
  try {
    const address = await Address.findByPk(req.params.id);

    if (!address) {
      throw new Error("Invalid address id provided.");
    }

    if (address.user_id !== req.user.id) {
      throw new Error("Address does not exists for user.");
    }

    return res.json({
      success: true,
      data: address,
      msg: "address",
    });
  } catch (error) {
    next(error);
  }
};

const addAddress = async (req, res, next) => {
  try {
    const address = await Address.create({
      ...req.body,
      user_id: req.user.id,
      is_default: true,
    });

    return res.json({
      success: true,
      data: address,
      msg: "address",
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findByPk(req.params.id);

    if (!address) {
      throw new Error("Invalid address id provided.");
    }

    if (address.user_id !== req.user.id) {
      throw new Error("Address does not exists for user.");
    }

    address.street = req.body.street ?? address.street;
    address.city = req.body.city ?? address.city;
    address.state = req.body.state ?? address.state;
    address.zip = req.body.zip ?? address.zip;
    address.country = req.body.country ?? address.country;
    address.is_default = req.body.is_default ?? address.is_default;

    await address.save();

    return res.json({
      success: true,
      data: address,
      msg: "address",
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findByPk(req.params.id);

    if (!address) {
      throw new Error("Invalid address id provided.");
    }

    if (address.user_id !== req.user.id) {
      throw new Error("Address does not exists for user.");
    }

    await address.destroy();

    return res.json({
      success: true,
      msg: "address",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  getAddressById,
  deleteAddress,
  addAddress,
  updateAddress,
};
