const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const InstituicaoEnsino = require('./InstituicaoEnsino');

const Aluno = sequelize.define('Aluno', {
  id_aluno: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  rg: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  endereco: {
    type: DataTypes.STRING,
    allowNull: false
  },
  curso: {
    type: DataTypes.STRING,
    allowNull: false
  },
  saldo_moedas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  },
  id_instituicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: InstituicaoEnsino,
      key: 'id_instituicao'
    }
  }
}, {
  tableName: 'alunos',
  timestamps: true
});

Aluno.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Usuario.hasOne(Aluno, { foreignKey: 'id_usuario', as: 'aluno' });

Aluno.belongsTo(InstituicaoEnsino, { foreignKey: 'id_instituicao', as: 'instituicao' });
InstituicaoEnsino.hasMany(Aluno, { foreignKey: 'id_instituicao', as: 'alunos' });

module.exports = Aluno;
