const { Usuario, Aluno, Professor, EmpresaParceira } = require('../models');
const { verificarSenha, gerarToken } = require('../services/AuthService');

class AuthController {
  // US09 - login com senha cadastrada
  async login(req, res) {
    try {
      const { login, senha } = req.body;
      if (!login || !senha) return res.status(400).json({ error: 'Informe login (e-mail) e senha.' });

      const usuario = await Usuario.findOne({ where: { login: login.trim() } });
      if (!usuario || !verificarSenha(senha, usuario.senha)) {
        return res.status(401).json({ error: 'Login ou senha inválidos.' });
      }

      const perfil = await AuthController.carregarPerfil(usuario);
      if (!perfil) return res.status(401).json({ error: 'Usuário sem perfil vinculado.' });

      const token = gerarToken({ id_usuario: usuario.id_usuario, perfil: usuario.tipo_perfil, id_entidade: perfil.id });
      return res.json({ token, perfil: usuario.tipo_perfil, nome: perfil.nome, id_entidade: perfil.id });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno ao autenticar.' });
    }
  }

  async me(req, res) {
    const usuario = await Usuario.findByPk(req.auth.id_usuario);
    if (!usuario) return res.status(401).json({ error: 'Usuário não encontrado.' });
    const perfil = await AuthController.carregarPerfil(usuario);
    return res.json({ perfil: usuario.tipo_perfil, nome: perfil?.nome, id_entidade: perfil?.id, login: usuario.login });
  }

  static async carregarPerfil(usuario) {
    const where = { id_usuario: usuario.id_usuario };
    if (usuario.tipo_perfil === 'ALUNO') {
      const a = await Aluno.findOne({ where });
      return a && { id: a.id_aluno, nome: a.nome };
    }
    if (usuario.tipo_perfil === 'PROFESSOR') {
      const p = await Professor.findOne({ where });
      return p && { id: p.id_professor, nome: p.nome };
    }
    const e = await EmpresaParceira.findOne({ where });
    return e && { id: e.id_empresa, nome: e.nome };
  }
}

module.exports = new AuthController();
module.exports.AuthController = AuthController;
