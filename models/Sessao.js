const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Filme = require("./Filme");
const Sala = require("./Sala");

const Sessao = sequelize.define("Sessao",{
    id:{
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    filme_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Filme, 
        key: "id",
      },
    },
    sala_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Sala, 
        key: "id",
      },
    },
    horario:{
      type: DataTypes.DATE,
      allowNull: false,
    },
    preco: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
});

Sessao.belongsTo(Filme, {
    constraints: true,
    foreignKey : "filme_id",
}),

Sessao.belongsTo(Sala, {
    constraints: true,
    foreignKey : "sala_id",
}),

Filme.hasMany(Sessao, {
    foreignKey: "filme_id",
}),

Sala.hasMany(Sessao, {
    foreignKey: "sala_id",
}),


module.exports = Sessao;
