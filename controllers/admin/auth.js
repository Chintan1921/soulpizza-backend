const { handleLogin } = require("../../services/authService");

const login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    return await handleLogin("admin", username, password, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};
