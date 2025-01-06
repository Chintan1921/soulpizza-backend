const { checkSchema } = require("express-validator");
// Todo: complete validations for all requests.
module.exports = {
  createStore: checkSchema({
    name: { notEmpty: { errorMessage: "Store name empty!" }, trim: true },
  }),
  updateStore: checkSchema({
    name: { notEmpty: { errorMessage: "Store name empty!" }, trim: true },
  }),

  createProduct: checkSchema({
    name: { notEmpty: { errorMessage: "Product name empty!" }, trim: true },
  }),
  updateProduct: checkSchema({
    name: { notEmpty: { errorMessage: "Product name empty!" }, trim: true },
  }),

  createProductCategory: checkSchema({
    name: { notEmpty: { errorMessage: "Category name empty!" }, trim: true },
  }),
  updateProductCategory: checkSchema({
    name: { notEmpty: { errorMessage: "Category name empty!" }, trim: true },
  }),

  createIngrediant: checkSchema({
    name: { notEmpty: { errorMessage: "Ingrediant name empty!" }, trim: true },
  }),
  updateIngrediant: checkSchema({
    name: { notEmpty: { errorMessage: "Ingrediant name empty!" }, trim: true },
  }),
};
