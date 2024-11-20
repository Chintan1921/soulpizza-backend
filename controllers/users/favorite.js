const { Op } = require("sequelize");
const { getImage } = require("../../lib/helper");
const Favorite = require("../../models/favorite");
const StoreProduct = require("../../models/storeProduct");
const Product = require("../../models/product");
const Ingrediant = require("../../models/ingrediant");
const ProductCategory = require("../../models/productCategory");
const ProductMaterial = require("../../models/material");

const getFavorite = async (req, res, next) => {
    try {
        let where = {
            user_id: req.user.id
        };

        const favoriteProduct = await Favorite.findAll({
            where,
            include: [
                {
                    as: "storeProduct",
                    model: StoreProduct,
                },
            ],
            order: [["updatedAt", "DESC"]],
        });

        const formatedResponse = []

        for (const favorite of favoriteProduct) {

            const product_id = favorite?.storeProduct?.product_id;

            const product = await Product.findOne({
                where: { id: product_id },
                include: [
                    {
                        model: Ingrediant,
                        as: "ingrediants",
                        attributes: ["id", "name", "category", "price"],
                        through: {
                          as: "productIngrediants",
                          attributes: [],
                          where: { is_required: true },
                        },
                    },
                    {
                        model: ProductCategory,
                        as: "productCategory",
                        attributes: ["id", "name"],
                    },
                    {
                        model: ProductMaterial,
                        as: "productMaterial",
                        attributes: ["id", "material"],
                    }
                ]
            });

            const image = product?.dataValues?.image
                ? await getImage(process.env.AWS_BUCKET_NAME, product?.dataValues?.image)
                : null;

            formatedResponse.push({
                ...product.dataValues,
                favorite: true,
                image: image,
            });
        }

        return res.json({
            success: true,
            msg: "favorites",
            data: formatedResponse,
        });
    } catch (error) {
        next(error);
    }
};

const addFavorite = async (req, res, next) => {
    try {
        const storeProduct = await StoreProduct.findByPk(req.body.storeProductId);

        if (!storeProduct) {
            throw new Error("Invalid Store Product ID provided");
        }

        const favorite = await Favorite.create({
            user_id: req.user.id,
            store_product_id: req.body.storeProductId
  });

        return res.json({
            success: true,
            data: favorite,
        });

    } catch (error) {
        next(error);
    }
};

const cancelFavorite = async (req, res, next) => {
    try {
        const favorite = await Favorite.findOne({
            where: {
                user_id: req.user.id,
                store_product_id: req.params.storeProductId
            }
        });
    
        if (!favorite) {
          throw new Error("Invalid Store Product Id provided");
        }
    
        await favorite.destroy();
    
        return res.json({
          success: true,
          data: favorite,
        });
      } catch (error) {
        next(error);
      }
}

module.exports = {
    getFavorite,
    addFavorite,
    cancelFavorite
};
