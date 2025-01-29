const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sessao = require("./Sessao");

const CompraSessao = sequelize.define("CompraSessao",{
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    sessao_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sessao, 
        key: "id",
      },
    },
    quantidade:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subtotal:{
        type: DataTypes.DECIMAL(10,2),
        allowNull:false,
    },
});

CompraSessao.belongsTo(Sessao, {
    constraints: true,
    foreignKey : "sessao_id",
}),

Sessao.hasMany(CompraSessao, {
    foreignKey: "sessao_id",
}),

module.exports = CompraSessao;
