const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Filme = sequelize.define("Filme", {
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duracao:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    classificacao:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    genero: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_lancamento:{
      type: DataTypes.DATE,
      allowNull: true,
    },
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    },
});

module.exports = Filme;
