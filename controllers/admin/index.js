const router = require("express").Router();

const productController = require("./product");
const productCategoryController = require("./product-category");
const ingrediantController = require("./ingrediant");
const storeController = require("./store");
const userController = require("./user");
const authController = require("./auth");
const orderController = require("./order");
const materialController = require("./material");
const menuController = require("./menu");
const favoriteController = require("./favorite");
const validator = require("./validator");

const { passport, authorize } = require("../../services/authService");
const { upload, uploadPdf } = require("../../lib/helper");

router.post("/login", authController.login);

router.use(passport.authenticate("jwt", { session: false }));
router.use(authorize("admin"));

router.get("/cities", storeController.getCities);
router.get("/states", storeController.getStates);
router.get("/store", storeController.getStores);
router.get("/store/:id", storeController.getStore);
router.post("/store", validator.createStore, storeController.createStore);
router.patch("/store/:id", storeController.updateStore);
router.delete("/store/:id", storeController.deleteStore);
//
router.get("/product", productController.getProduct);
router.get("/product/:id", productController.getProductById);
router.post(
  "/product",
  // validator.createProduct,
  upload,
  productController.createProduct
);
router.patch("/product/:id", upload, productController.updateProduct);
router.delete("/product/:id", productController.deleteProduct);
//
router.get("/productCategory", productCategoryController.getProductCategory);
router.get(
  "/productCategory/:fieldSet",
  productCategoryController.getProductCategory
);
router.post(
  "/productCategory",
  // validator.createProductCategory,
  upload,
  productCategoryController.createProductCategory
);
router.patch(
  "/productCategory/:id",
  // validator.updateProductCategory,
  upload,
  productCategoryController.updateProductCategory
);
router.delete(
  "/productCategory/:id",
  productCategoryController.deleteProductCategory
);
//
router.get("/ingrediant", ingrediantController.getIngrediants);
router.post(
  "/ingrediant",
  validator.createIngrediant,
  ingrediantController.createIngrediant
);
router.patch("/ingrediant/:id", ingrediantController.updateIngrediant);
router.delete("/ingrediant/:id", ingrediantController.deleteIngrediant);

router.get("/users", userController.getUsers);

router.get("/order", orderController.getOrders);
router.get("/order/:orderId", orderController.getOrderDetail);
router.patch("/order/:orderId", orderController.updateOrder);

router.get("/material", materialController.getMaterials);
router.post("/material", materialController.addMaterial);
router.patch("/material/:id", materialController.updateMaterial);
router.delete("/material/:id", materialController.deleteMaterial);

router.get("/menu", menuController.getMenus);
router.post(
  "/menu",
  // validator.createProduct,
  uploadPdf,
  menuController.addMenu
);

router.get("/favorite", favoriteController.getFavorite);

module.exports = router;
