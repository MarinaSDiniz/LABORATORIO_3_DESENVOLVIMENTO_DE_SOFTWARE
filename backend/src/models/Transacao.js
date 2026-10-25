const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Aluno = require('./Aluno');
const Professor = require('./Professor');
const Vantagem = require('./Vantagem');
const EmpresaParceira = require('./EmpresaParceira');

// ENVIO: professor -> aluno (motivo obrigatório)
// RESGATE: aluno troca moedas por vantagem (gera código de cupom)
const Transacao = sequelize.define('Transacao', {
  id_transacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: { type: DataTypes.ENUM('ENVIO', 'RESGATE'), allowNull: false },
  valor: { type: DataTypes.INTEGER, allowNull: false },
  motivo: { type: DataTypes.TEXT, allowNull: true },
  codigo_cupom: { type: DataTypes.STRING, allowNull: true, unique: true },
  cupom_utilizado: { type: DataTypes.BOOLEAN, defaultValue: false },
  id_aluno: { type: DataTypes.INTEGER, allowNull: false },
  id_professor: { type: DataTypes.INTEGER, allowNull: true },
  id_vantagem: { type: DataTypes.INTEGER, allowNull: true },
  id_empresa: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'transacoes',
  timestamps: true
});

Transacao.belongsTo(Aluno, { foreignKey: 'id_aluno', as: 'aluno' });
Transacao.belongsTo(Professor, { foreignKey: 'id_professor', as: 'professor' });
Transacao.belongsTo(Vantagem, { foreignKey: 'id_vantagem', as: 'vantagem' });
Transacao.belongsTo(EmpresaParceira, { foreignKey: 'id_empresa', as: 'empresa' });

module.exports = Transacao;
