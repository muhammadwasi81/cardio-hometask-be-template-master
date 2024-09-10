const app = require("./routes/routes.js");
const { sequelize } = require("./models/model.js");
const colors = require("colors");
const dotenv = require("dotenv");

dotenv.config();

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV;
async function init() {
  try {
    await sequelize.sync({ force: true });
    console.log(
      colors.green(
        "Database synced successfully. SQLite database file should now exist."
      )
    );

    app.listen(3001, () => {
      console.log(
        colors.blue.underline(
          `Server is running in ${NODE_ENV} mode on https://localhost:${PORT} successfully`
        )
      );
    });
  } catch (error) {
    console.error(
      colors.red.bold(`An error occurred: ${JSON.stringify(error)}`)
    );
    process.exit(1);
  }
}

init();
