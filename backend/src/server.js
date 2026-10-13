const express = require('express');
const cors = require('cors');
const { sequelize, InstituicaoEnsino } = require('./models');
const alunoRoutes = require('./routes/alunoRoutes');
const empresaRoutes = require('./routes/empresaRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/alunos', alunoRoutes);
app.use('/api/empresas', empresaRoutes);

// Endpoint utilitário para listar instituições (usado no cadastro de alunos)
app.get('/api/instituicoes', async (req, res) => {
  try {
    const instituicoes = await InstituicaoEnsino.findAll({ order: [['nome', 'ASC']] });
    res.json(instituicoes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar instituições de ensino.' });
  }
});

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'API em funcionamento', orm: 'Sequelize', database: 'SQLite' });
});

// Inicialização e sincronização do Banco de Dados
async function startServer() {
  try {
    // Sincroniza tabelas do ORM
    await sequelize.sync({ alter: true });
    console.log('✅ Banco de dados SQLite sincronizado com sucesso via Sequelize ORM.');

    // Seed inicial de instituições de ensino se a tabela estiver vazia
    const count = await InstituicaoEnsino.count();
    if (count === 0) {
      await InstituicaoEnsino.bulkCreate([
        { nome: 'PUC Minas - Coração Eucarístico' },
        { nome: 'PUC Minas - Praça da Liberdade' },
        { nome: 'PUC Minas - São Gabriel' },
        { nome: 'UFMG - Universidade Federal de Minas Gerais' },
        { nome: 'CEFET-MG' }
      ]);
      console.log('🌱 Instituições de ensino de exemplo inseridas com sucesso.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar o servidor:', error);
  }
}

startServer();
