const router = require("express").Router();
const authController = require("./auth");
const validator = require("./validator");
const productCategoryController = require("./product-category");
const productController = require("./product");
const storeController = require("./store");
const orderController = require("./order");

const { passport, authorize, me } = require("../../services/authService");
router.post("/login", authController.login);

router.use(passport.authenticate("jwt", { session: false }));
router.use(authorize("store"));

router.get("/me", me);
router.patch("/me", storeController.updateStore);
router.get("/productCategory", productCategoryController.getProductCategory);
router.patch(
  "/productCategory/:id",
  productCategoryController.updateProductCategory
);

router.get("/product", productController.getProduct);
router.patch("/product/:id", productController.updateProduct);
router.post("/change-password", authController.changePassword);

router.get("/order", orderController.getOrders);
router.get("/newOrder", orderController.getNewOrders);
router.get("/order/:id", orderController.getOrderDetail);
router.patch("/order/:id", orderController.updateOrder);
router.patch("/updateOrderPickupTime/:id", orderController.updatePickupTime);

router.get("/cities", storeController.getCities);
router.get("/states", storeController.getStates);

module.exports = router;
