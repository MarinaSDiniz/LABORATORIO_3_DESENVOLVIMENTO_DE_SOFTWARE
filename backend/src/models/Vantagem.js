const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const EmpresaParceira = require('./EmpresaParceira');

const Vantagem = sequelize.define('Vantagem', {
  id_vantagem: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: false },
  foto: { type: DataTypes.TEXT, allowNull: false }, // URL ou imagem em Data URL (base64)
  custo_moedas: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  ativa: { type: DataTypes.BOOLEAN, defaultValue: true },
  id_empresa: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'vantagens',
  timestamps: true
});

Vantagem.belongsTo(EmpresaParceira, { foreignKey: 'id_empresa', as: 'empresa' });
EmpresaParceira.hasMany(Vantagem, { foreignKey: 'id_empresa', as: 'vantagens' });

module.exports = Vantagem;
