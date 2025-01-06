const express = require("express");
const router = express.Router();
const userController = require("./controllers/users");
const adminController = require("./controllers/admin");
const storeController = require("./controllers/branch");

router.use("/user", userController);
router.use("/admin", adminController);
router.use("/store", storeController);

module.exports = router;
