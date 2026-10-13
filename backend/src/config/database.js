const { Sequelize } = require('sequelize');
const path = require('path');

// Estratégia de Acesso a Dados: ORM (Sequelize) com SQLite para fácil execução e portabilidade
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false // Alterne para console.log se desejar ver as queries SQL geradas
});

module.exports = sequelize;
