const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Itens_Carrinho = sequelize.define("Itens_carrinho", {
    id:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    Carrinho_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Carrinho,
            key: "id"
        }
    },

    assento_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Assento,
            key: id,
        }
    },

    alimento_id: {
        type: DataTypes.INTEGER,
        allowNull:true,
        references: {
            model: Alimento,
            key: id,
        }
    },

    quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    subtotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
})