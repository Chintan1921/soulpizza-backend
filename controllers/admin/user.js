const { Op } = require("sequelize");
const { getOffsetAndLimit } = require("../../lib/helper");
const User = require("../../models/user");

// User apis

const getUsers = async (req, res, next) => {
  try {
    const { offset, limit, page } = getOffsetAndLimit(req?.query);
    const searchText = req?.query?.search;
    let where = {};

    if (searchText) {
      where = {
        [Op.or]: [
          {
            name: {
              [Op.iLike]: `%${searchText}%`,
            },
          },
          {
            mobile: {
              [Op.iLike]: `%${searchText}%`,
            },
          },
          {
            email: {
              [Op.iLike]: `%${searchText}%`,
            },
          },
        ],
      };
    }

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      offset,
      limit,
      distinct: true,
      order: [["updatedAt", "DESC"]]
    });

    return res.send({ success: true, msg: "Users", data: users, page, total });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
};
