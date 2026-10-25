const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, InstituicaoEnsino, Professor } = require('./models');
const ProfessorDAO = require('./dao/ProfessorDAO');
const alunoRoutes = require('./routes/alunoRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const portalRoutes = require('./routes/portalRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '6mb' })); // fotos de vantagens em base64

// Frontend estático (http://localhost:3001)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Rotas da API (portal autenticado primeiro, para /alunos/me não colidir com /alunos/:id)
app.use('/api', portalRoutes);
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

    // Professores são pré-cadastrados pela instituição (senha padrão: 123456)
    if (await Professor.count() === 0) {
      const insts = await InstituicaoEnsino.findAll({ order: [['id_instituicao', 'ASC']] });
      const seed = [
        { nome: 'Ana Souza', email: 'ana.souza@prof.com', cpf: '111.111.111-11', departamento: 'Engenharia de Software', id_instituicao: insts[0].id_instituicao },
        { nome: 'Carlos Lima', email: 'carlos.lima@prof.com', cpf: '222.222.222-22', departamento: 'Ciência da Computação', id_instituicao: insts[0].id_instituicao },
        { nome: 'Beatriz Rocha', email: 'beatriz.rocha@prof.com', cpf: '333.333.333-33', departamento: 'Sistemas de Informação', id_instituicao: insts[3].id_instituicao }
      ];
      await sequelize.transaction(async (t) => {
        for (const p of seed) await ProfessorDAO.criar(p, '123456', t);
      });
      console.log('🌱 Professores de exemplo inseridos (login = e-mail, senha 123456).');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar o servidor:', error);
  }
}

startServer();
