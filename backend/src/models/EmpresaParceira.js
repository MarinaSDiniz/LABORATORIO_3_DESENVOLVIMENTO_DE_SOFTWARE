const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const EmpresaParceira = sequelize.define('EmpresaParceira', {
  id_empresa: {
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
  cnpj: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  }
}, {
  tableName: 'empresas_parceiras',
  timestamps: true
});

EmpresaParceira.belongsTo(Usuario, { foreignKey: 'id_usuario', as: 'usuario' });
Usuario.hasOne(EmpresaParceira, { foreignKey: 'id_usuario', as: 'empresa' });

module.exports = EmpresaParceira;
