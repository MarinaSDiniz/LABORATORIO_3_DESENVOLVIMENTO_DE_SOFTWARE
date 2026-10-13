const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InstituicaoEnsino = sequelize.define('InstituicaoEnsino', {
  id_instituicao: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'instituicoes_ensino',
  timestamps: true
});

module.exports = InstituicaoEnsino;
