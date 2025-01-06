const { Op } = require("sequelize");
const Favorite = require("../../models/favorite");
const Product = require("../../models/product");
const StoreProduct = require("../../models/storeProduct");
const Ingrediant = require("../../models/ingrediant");
const ProductCategory = require("../../models/productCategory");
const ProductMaterial = require("../../models/material");
const User = require("../../models/user");
const { getImage } = require("../../lib/helper");

const getFavorite = async (req, res, next) => {
    try {
        const favoriteProduct = await Favorite.findAll({
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

            const user_id = favorite?.user_id;
            const user = await User.findOne({
                where: { id: user_id },
                attributes: ["id", "name"]
            })

            const product_id = favorite?.storeProduct?.product_id;
            const product = await Product.findOne({
                where: { id: product_id },
                attributes: [ "id", "name", "price", "image" ],
                include: [
                    {
                        model: ProductCategory,
                        as: "productCategory",
                        attributes: ["id", "name"],
                    }
                ]
            });

            const image = product?.image
                ? await getImage(process.env.AWS_BUCKET_NAME, product?.image)
                : null;

            formatedResponse.push({
                user: user,
                product: {
                    ...product.dataValues,
                    price: product?.price.price,
                    productCategory: product?.productCategory.name,
                    image: image
                },
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

module.exports = {
    getFavorite
};
