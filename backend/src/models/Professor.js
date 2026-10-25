const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const InstituicaoEnsino = require('./InstituicaoEnsino');

// Professores são pré-cadastrados pela instituição (seed). Recebem 1.000 moedas por semestre (acumulável).
const Professor = sequelize.define('Professor', {
  id_professor: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  cpf: { type: DataTypes.STRING(14), allowNull: false, unique: true },
  departamento: { type: DataTypes.STRING, allowNull: false },
  saldo_moedas: { type: DataTypes.INTEGER, defaultValue: 0 },
  semestre_ultimo_credito: { type: DataTypes.STRING(7), allowNull: true }, // ex.: "2026-2"
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  id_instituicao: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'professores',
  timestamps: true
});

Professor.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Usuario.hasOne(Professor, { foreignKey: 'id_usuario', as: 'professor' });
Professor.belongsTo(InstituicaoEnsino, { foreignKey: 'id_instituicao', as: 'instituicao' });
InstituicaoEnsino.hasMany(Professor, { foreignKey: 'id_instituicao', as: 'professores' });

module.exports = Professor;
