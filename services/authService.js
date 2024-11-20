const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = "your_jwt_secret"; // Replace with your own secret key

const Admin = require("../models/admin");
const User = require("../models/user");
const Store = require("../models/store");

const jwtOptions = {
  secretOrKey: JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      let user;

      if (payload.type === "U" || payload.role === "user") {
        user = await User.findByPk(payload.id);
      } else if (payload.type === "A" || payload.role === "admin") {
        user = await Admin.findByPk(payload.id);
      } else {
        user = await Store.findByPk(payload.id);
      }

      if (!user) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

// module.exports.passport = passport;

const authorize = (role) => {
  return async (req, res, next) => {
    try {
      const Model = role === "admin" ? Admin : role === "user" ? User : Store;
      const user = await Model.findByPk(req.user.id);
      if (!user) {
        return res.status(401).json({ msg: "Unauthorized" });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

const generateToken = (userId, model) => {
  let payload = { id: userId };
  payload.type = model === "admin" ? "A" : model === "user" ? "U" : "S";
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "45m",
  });
};

const handleLogin = async function (model, username, password, res) {
  const Model = model === "admin" ? Admin : model === "user" ? User : Store;

  try {
    const entity = await Model.findOne({
      where: model === "admin" ? { username } : { email: username },
    });

    if (!entity) {
      return res.status(401).json({ msg: "Authentication failed" });
    }

    const isMatch = await bcrypt.compare(password, entity.password);
    if (isMatch) {
      return res.json({
        token: generateToken(entity.id, model),
      });
    }

    return res.status(401).json({ msg: "Authentication failed" });
  } catch (error) {
    throw error;
  }
};

const handleChangePassword = async function (
  password,
  confirm_passowrd,
  old_password,
  req,
  res
) {
  try {
    if (password != confirm_passowrd) {
      throw new Error("Password should match Confirm Password.");
    }

    const isMatch = await bcrypt.compare(old_password, req.user.password);

    if (!isMatch) {
      throw new Error("Password doesn't match old password.");
    }

    await req.user.update({
      password: await bcrypt.hash(password, 8),
    });

    return res.send({ success: true, msg: "password changed." });
  } catch (error) {
    throw error;
  }
};

const me = (req, res, next) => {
  if (req.user.password) {
    delete req.user.dataValues?.password;
  }

  return res.send({
    success: true,
    msg: "Logged in user.",
    data: req.user,
  });
};

module.exports = {
  passport,
  authorize,
  generateToken,
  handleLogin,
  handleChangePassword,
  me,
};
