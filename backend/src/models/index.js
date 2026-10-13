const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const InstituicaoEnsino = require('./InstituicaoEnsino');
const Aluno = require('./Aluno');
const EmpresaParceira = require('./EmpresaParceira');

module.exports = {
  sequelize,
  Usuario,
  InstituicaoEnsino,
  Aluno,
  EmpresaParceira
};
