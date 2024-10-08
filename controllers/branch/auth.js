const {
  handleLogin,
  handleChangePassword,
} = require("../../services/authService");

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    return await handleLogin("store", email, password, res);
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
  changePassword,
};
