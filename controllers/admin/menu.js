const { getPdf } = require("../../lib/helper");
const Menu = require("../../models/menu");

// Menu apis

const getMenus = async (req, res, next) => {
  try {
    let menus = await Menu.findAll({});

    if (menus?.length) {
        for (const menu of menus) {
          menu.dataValues.pdf = await getPdf(
            process.env.AWS_BUCKET_NAME,
            menu.pdf
          );
        }
    }

    return res.send({ success: true, msg: "Menus", data: menus });
  } catch (error) {
    next(error);
  }
};


const addMenu = async (req, res, next) => {
  try {
    let menu = await Menu.findOne({
      where: { id: 1 },
    });

    if (menu !== null) {
      // Update menu
      menu.pdf = req.file.key ?? menu.pdf;
      await menu.save();
    } else {
        menu = await Menu.create({
            id: 1,
            pdf: req.file.key,
        });
    }

    return res.json({
      success: true,
      msg: "Menu created.",
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMenus,
  addMenu,
};
