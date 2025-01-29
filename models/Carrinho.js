const {DataTypes} = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Carrinho = sequelize.define("Carrinho", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allownull: false, 
        primaryKey: true
    },

    Usuario_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuario, 
            key: "id",
          },
    },

    status:{
        type: DataTypes.STRING,
        allowNull: false,
    },
});