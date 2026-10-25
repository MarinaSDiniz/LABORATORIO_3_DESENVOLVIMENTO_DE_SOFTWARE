const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Registro de todos os e-mails disparados pelo sistema (caixa de entrada visível no portal)
const Notificacao = sequelize.define('Notificacao', {
  id_notificacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  destinatario: { type: DataTypes.STRING, allowNull: false },
  assunto: { type: DataTypes.STRING, allowNull: false },
  corpo: { type: DataTypes.TEXT, allowNull: false },
  enviado_smtp: { type: DataTypes.BOOLEAN, defaultValue: false },
  id_usuario: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'notificacoes',
  timestamps: true
});

module.exports = Notificacao;
