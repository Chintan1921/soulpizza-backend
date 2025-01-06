const router = require("express").Router();

const authController = require("./auth");
const storeController = require("./store");
const productController = require("./product");
const cartController = require("./cart");
const orderController = require("./order");
const addressController = require("./address");
const materialController = require("../admin/material");
const menuController = require("../admin/menu");
const favoriteController = require("./favorite");
const contactUsController = require("./contactUs");
const billingController = require("./billing");
const comboDealController = require("./comboDealController");

const validator = require("./validator");

const { passport, authorize, me } = require("../../services/authService");

router.post("/login", authController.login);
router.post("/register", authController.register);

router.get("/cities", storeController.getCities);
router.get("/states", storeController.getStates);
router.get("/store", storeController.getStores);
router.get("/store/:id", storeController.getStore);
router.get("/store/:id/categories", storeController.getEnabledCategories);
router.get(
  "/store/:id/products/:storeCategoryId",
  storeController.getEnabledProducts
);

// router.get("/combo-deals", comboDealController.getComboDeals);
// router.post("/combo-deals", comboDealController.createComboDeal);
// router.patch("/combo-deals/:id", comboDealController.updateComboDeal);
// router.delete("/combo-deals/:id", comboDealController.deleteComboDeal);

router.get("/product", productController.getProduct);
router.get("/product/:id", productController.getProductById);

router.post("/change-password", authController.changePassword);

router.get("/material", materialController.getMaterials);

router.get("/menu", menuController.getMenus);

// -----------------------------------------------------------------------------------------------------------------
router.use(passport.authenticate("jwt", { session: false }));
router.use(authorize("user"));

router.get("/me", me);

router.get("/cart", cartController.getCartItems);
router.get("/cart/:id", cartController.getCartItems);
router.post("/cart", cartController.addToCart);
router.patch("/cart/:id", cartController.editCart);
router.delete("/cart/all", cartController.emptyCart);
router.delete("/cart/:id", cartController.deleteCart);
router.post("/combo-deals", comboDealController.addToCartComboDeal);

router.post("/order/delivery-status", orderController.deliveryTimeCheck);
router.get("/order", orderController.getOrders);
router.get("/order/:orderId", orderController.getOrderDetail);
router.post("/order", orderController.placeOrder);
router.post("/checkout", billingController.billing);
router.post("/check-coupon", billingController.validateCoupon);
router.get("/address", addressController.getAddresses);
router.get("/address/:id", addressController.getAddressById);
router.patch("/address/:id", addressController.updateAddress);
router.post("/address", addressController.addAddress);
router.delete("/address/:id", addressController.deleteAddress);

router.get("/favorite", favoriteController.getFavorite);
router.post("/favorite", favoriteController.addFavorite);
router.delete("/favorite/:storeProductId", favoriteController.cancelFavorite);

router.post("/contactUs", contactUsController.contactUsEmail);

module.exports = router;
