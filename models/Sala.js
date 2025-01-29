const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Cinema = require("./Cinema");

const Sala = sequelize.define("Sala", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    capacidade:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    cinema_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Cinema, 
            key: "id",
          },
    },
});

Sala.belongsTo(Cinema, {
    constraints: true,
    foreignKey : "cinema_id",
}),

Cinema.hasMany(Sala, {
    foreignKey: "cinema_id",
}),

module.exports = Sala;
