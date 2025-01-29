const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Usuario = sequelize.define("Usuario", {
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
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    data_nascimento: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    is_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue:false,
    },
});

Usuario.beforeSave(async (usuario) => {
    const adminEmails = ["slrs@discente.ifpe.edu.br", "scac@discente.ifpe.edu.br", "mecs6@discente.ifpe.edu.br", "lcga1@discente.ifpe.edu.br"];
    if (adminEmails.includes(usuario.email)) {
        usuario.is_admin = true;
    } 
    else if (usuario.is_admin) {
        throw new Error("Apenas e-mails autorizados podem ser administradores.");
    }
});

module.exports = Usuario;
