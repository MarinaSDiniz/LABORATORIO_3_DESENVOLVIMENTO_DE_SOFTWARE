const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo_perfil: {
    type: DataTypes.ENUM('ALUNO', 'PROFESSOR', 'EMPRESA'),
    allowNull: false
  }
}, {
  tableName: 'usuarios',
  timestamps: true
});

// Segurança (US09): senha armazenada com hash scrypt + salt
const { hashSenha } = require('../services/AuthService');
Usuario.beforeSave((usuario) => {
  if (usuario.changed('senha') && !String(usuario.senha).startsWith('scrypt$')) {
    usuario.senha = hashSenha(usuario.senha);
  }
});

module.exports = Usuario;
