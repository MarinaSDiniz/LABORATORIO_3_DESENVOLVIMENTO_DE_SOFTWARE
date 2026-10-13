const EmpresaParceiraDAO = require('../dao/EmpresaParceiraDAO');

class EmpresaParceiraController {
  async listar(req, res) {
    try {
      const empresas = await EmpresaParceiraDAO.listarTodas();
      return res.status(200).json(empresas);
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      return res.status(500).json({ error: 'Erro interno ao listar empresas parceiras.' });
    }
  }

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const empresa = await EmpresaParceiraDAO.buscarPorId(id);
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa parceira não encontrada.' });
      }
      return res.status(200).json(empresa);
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return res.status(500).json({ error: 'Erro interno ao buscar empresa parceira.' });
    }
  }

  async criar(req, res) {
    try {
      const { nome, email, cnpj, senha, login } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({
          error: 'Campos obrigatórios: nome, email, senha.'
        });
      }

      const existente = await EmpresaParceiraDAO.buscarPorEmail(email);
      if (existente) {
        return res.status(400).json({
          error: 'Já existe uma empresa parceira cadastrada com este e-mail.'
        });
      }

      const novaEmpresa = await EmpresaParceiraDAO.criar(
        { nome, email, cnpj },
        { login: login || email, senha }
      );

      return res.status(201).json(novaEmpresa);
    } catch (error) {
      console.error('Erro ao criar empresa parceira:', error);
      return res.status(500).json({ error: 'Erro interno ao cadastrar empresa parceira.', details: error.message });
    }
  }

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { nome, email, cnpj, senha, login } = req.body;

      const existente = await EmpresaParceiraDAO.buscarPorId(id);
      if (!existente) {
        return res.status(404).json({ error: 'Empresa parceira não encontrada.' });
      }

      if (email) {
        const duplicado = await EmpresaParceiraDAO.buscarPorEmail(email, id);
        if (duplicado) {
          return res.status(400).json({ error: 'E-mail já utilizado por outra empresa parceira.' });
        }
      }

      const dadosUsuario = {};
      if (login) dadosUsuario.login = login;
      if (senha) dadosUsuario.senha = senha;

      const empresaAtualizada = await EmpresaParceiraDAO.atualizar(
        id,
        { nome, email, cnpj },
        Object.keys(dadosUsuario).length > 0 ? dadosUsuario : null
      );

      return res.status(200).json(empresaAtualizada);
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      return res.status(500).json({ error: 'Erro interno ao atualizar empresa parceira.' });
    }
  }

  async deletar(req, res) {
    try {
      const { id } = req.params;
      const removido = await EmpresaParceiraDAO.deletar(id);
      if (!removido) {
        return res.status(404).json({ error: 'Empresa parceira não encontrada.' });
      }
      return res.status(200).json({ message: 'Empresa parceira removida com sucesso.' });
    } catch (error) {
      console.error('Erro ao deletar empresa parceira:', error);
      return res.status(500).json({ error: 'Erro interno ao excluir empresa parceira.' });
    }
  }
}

module.exports = new EmpresaParceiraController();
