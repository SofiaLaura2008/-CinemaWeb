const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Sessao = require("./Sessao");

const AssentoComprado = sequelize.define("AssentoComprado",{
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
    assento:{
      type: DataTypes.STRING,
      allowNull: false
    },
});

AssentoComprado.belongsTo(Sessao, {
    constraints: true,
    foreignKey : "sessao_id",
}),

Sessao.hasMany(AssentoComprado, {
    foreignKey: "sessao_id",
}),

module.exports = AssentoComprado;
