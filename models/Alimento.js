const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const Alimento = sequelize.define("Alçimento",{
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    nome: {
      type: DataTypes.String,
      allowNull: false,
    },
    preco: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantidadeDisponível:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tipoAlimentos:{
      type: DataTypes.STRING,
      allowNull: false,
    },
});

module.exports = Alimento;
