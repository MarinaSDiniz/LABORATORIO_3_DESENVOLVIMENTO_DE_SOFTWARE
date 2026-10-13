const AlunoDAO = require('../dao/AlunoDAO');
const { InstituicaoEnsino } = require('../models');

class AlunoController {
  async listar(req, res) {
    try {
      const alunos = await AlunoDAO.listarTodos();
      return res.status(200).json(alunos);
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      return res.status(500).json({ error: 'Erro interno ao listar alunos.' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const aluno = await AlunoDAO.buscarPorId(id);
      if (!aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado.' });
      }
      return res.status(200).json(aluno);
    } catch (error) {
      console.error('Erro ao buscar aluno:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar aluno.' });
    }
  }

  async criar(req, res) {
    try {
      const { nome, email, cpf, rg, endereco, curso, id_instituicao, senha, login } = req.body;

      if (!nome || !email || !cpf || !rg || !endereco || !curso || !id_instituicao || !senha) {
        return res.status(400).json({
          error: 'Campos obrigatórios: nome, email, cpf, rg, endereco, curso, id_instituicao, senha.'
        });
      }

      // Validação de duplicidade
      const existente = await AlunoDAO.buscarPorEmailOuCpf(email, cpf);
      if (existente) {
        return res.status(400).json({
          error: 'Já existe um aluno cadastrado com este e-mail ou CPF.'
        });
      }

      const instituicao = await InstituicaoEnsino.findByPk(id_instituicao);
      if (!instituicao) {
        return res.status(400).json({ error: 'Instituição de ensino informada não existe.' });
      }

      const novoAluno = await AlunoDAO.criar(
        { nome, email, cpf, rg, endereco, curso, id_instituicao, saldo_moedas: 0 },
        { login: login || email, senha }
      );

      return res.status(201).json(novoAluno);
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      return res.status(500).json({ error: 'Erro interno ao cadastrar aluno.', details: error.message });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, cpf, rg, endereco, curso, id_instituicao, senha, login, saldo_moedas } = req.body;

      const existente = await AlunoDAO.buscarPorId(id);
      if (!existente) {
        return res.status(404).json({ error: 'Aluno não encontrado.' });
      }

      if (email || cpf) {
        const duplicado = await AlunoDAO.buscarPorEmailOuCpf(
          email || existente.email,
          cpf || existente.cpf,
          id
        );
        if (duplicado) {
          return res.status(400).json({ error: 'E-mail ou CPF já utilizado por outro aluno.' });
        }
      }

      const dadosUsuario = {};
      if (login) dadosUsuario.login = login;
      if (senha) dadosUsuario.senha = senha;

      const alunoAtualizado = await AlunoDAO.atualizar(
        id,
        { nome, email, cpf, rg, endereco, curso, id_instituicao, saldo_moedas },
        Object.keys(dadosUsuario).length > 0 ? dadosUsuario : null
      );

      return res.status(200).json(alunoAtualizado);
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar aluno.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const removido = await AlunoDAO.deletar(id);
      if (!removido) {
        return res.status(404).json({ error: 'Aluno não encontrado.' });
      }
      return res.status(200).json({ message: 'Aluno removido com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      return res.status(500).json({ error: 'Erro interno ao excluir aluno.' });
    }
  }
}

module.exports = new AlunoController();
