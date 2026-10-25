const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const InstituicaoEnsino = require('./InstituicaoEnsino');
const Aluno = require('./Aluno');
const EmpresaParceira = require('./EmpresaParceira');
const Professor = require('./Professor');
const Vantagem = require('./Vantagem');
const Transacao = require('./Transacao');
const Notificacao = require('./Notificacao');

module.exports = {
  sequelize,
  Usuario,
  InstituicaoEnsino,
  Aluno,
  EmpresaParceira,
  Professor,
  Vantagem,
  Transacao,
  Notificacao
};
