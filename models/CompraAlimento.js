const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Alimento = require("./Alimento");

const CompraAlimento = sequelize.define("CompraAlimento",{
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    alimento_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Alimento, 
        key: "id",
      },
    },
    quantidade:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    preco_unitario:{
        type: DataTypes.DECIMAL(10,2),
        allowNull:false,
    },
    subtotal:{
        type: DataTypes.DECIMAL(10,2),
        allowNull:false,
    },
});

CompraAlimento.belongsTo(Alimento, {
    constraints: true,
    foreignKey : "alimento_id",
}),

Alimento.hasMany(CompraAlimento, {
    foreignKey: "alimento_id",
}),

module.exports = CompraAlimento;
