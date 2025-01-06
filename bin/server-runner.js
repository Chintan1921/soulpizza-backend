const app = require("../app");
const PORT = process.env.APP_PORT || 3000;
const Sequelize = require("sequelize").Sequelize;

app.use(function (err, req, res, next) {
  let response = {
    msg: err.message,
    error: err.stack,
    success: false,
  };

  if (err instanceof Sequelize.ValidationError) {
    response.message = "";
    err.errors.map((error) => (response.message += error.message));
    err.status = 400;
  }

  res.status(err.status || 500);
  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
