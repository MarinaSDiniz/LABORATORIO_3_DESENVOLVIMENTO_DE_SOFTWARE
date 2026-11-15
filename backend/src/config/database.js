const { Sequelize } = require('sequelize');
const path = require('path');

// ORM (Sequelize): PostgreSQL em producao (DATABASE_URL) e SQLite local como fallback de desenvolvimento
let sequelize;
if (process.env.DATABASE_URL) {
  const useSsl = process.env.DB_SSL !== 'false';
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {}
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false
  });
}

module.exports = sequelize;