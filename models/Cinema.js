const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cinema = sequelize.define("Cinema", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    local:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    capacidade:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = Cinema;
