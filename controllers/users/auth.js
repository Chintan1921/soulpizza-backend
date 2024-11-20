const User = require("../../models/user");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

const {
  handleLogin,
  handleChangePassword,
  generateToken,
} = require("../../services/authService");

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    return await handleLogin("user", email, password, res);
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    let emailExists = await User.findOne({
      where: {
        email: {
          [Op.iLike]: req.body.email,
        },
      },
    });

    if (emailExists) {
      throw new Error("Email already exists.");
    }

    req.body.password = await bcrypt.hash(req.body.password, 8);
    req.body.mobile = req.body.phone;
    delete req.body.phone;
    const user = await User.create(req.body);
    const token = generateToken(user.id, "user");

    return res.status(201).json({
      success: true,
      msg: "user registered.",
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  const { password, confirm_password, old_password } = req.body;
  try {
    return await handleChangePassword(
      password,
      confirm_password,
      old_password,
      req,
      res
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  changePassword,
};
