const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./cinema.sqlite"
});

module.exports = sequelize;