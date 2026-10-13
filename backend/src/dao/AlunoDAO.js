const { Aluno, Usuario, InstituicaoEnsino, sequelize } = require('../models');

// Padrão DAO / Repository para abstração e desacoplamento do acesso ao banco de dados
class AlunoDAO {
  async listarTodos() {
    return await Aluno.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'login', 'tipo_perfil'] },
        { model: InstituicaoEnsino, as: 'instituicao', attributes: ['id_instituicao', 'nome'] }
      ],
      order: [['id_aluno', 'DESC']]
    });
  }

  async buscarPorId(id) {
    return await Aluno.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'login', 'tipo_perfil'] },
        { model: InstituicaoEnsino, as: 'instituicao', attributes: ['id_instituicao', 'nome'] }
      ]
    });
  }

  async buscarPorEmailOuCpf(email, cpf, ignorarId = null) {
    const { Op } = require('sequelize');
    const where = {
      [Op.or]: [{ email }, { cpf }]
    };
    if (ignorarId) {
      where.id_aluno = { [Op.ne]: ignorarId };
    }
    return await Aluno.findOne({ where });
  }

  async criar(dadosAluno, dadosUsuario) {
    const transaction = await sequelize.transaction();
    try {
      // 1. Cria usuário correspondente
      const usuario = await Usuario.create({
        login: dadosUsuario.login || dadosAluno.email,
        senha: dadosUsuario.senha,
        tipo_perfil: 'ALUNO'
      }, { transaction });

      // 2. Cria o aluno vinculado
      const aluno = await Aluno.create({
        nome: dadosAluno.nome,
        email: dadosAluno.email,
        cpf: dadosAluno.cpf,
        rg: dadosAluno.rg,
        endereco: dadosAluno.endereco,
        curso: dadosAluno.curso,
        saldo_moedas: dadosAluno.saldo_moedas || 0,
        id_usuario: usuario.id_usuario,
        id_instituicao: dadosAluno.id_instituicao
      }, { transaction });

      await transaction.commit();
      return await this.buscarPorId(aluno.id_aluno);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async atualizar(id, dadosAluno, dadosUsuario) {
    const transaction = await sequelize.transaction();
    try {
      const aluno = await Aluno.findByPk(id);
      if (!aluno) return null;

      await aluno.update({
        nome: dadosAluno.nome,
        email: dadosAluno.email,
        cpf: dadosAluno.cpf,
        rg: dadosAluno.rg,
        endereco: dadosAluno.endereco,
        curso: dadosAluno.curso,
        saldo_moedas: dadosAluno.saldo_moedas !== undefined ? dadosAluno.saldo_moedas : aluno.saldo_moedas,
        id_instituicao: dadosAluno.id_instituicao || aluno.id_instituicao
      }, { transaction });

      if (dadosUsuario) {
        const usuario = await Usuario.findByPk(aluno.id_usuario);
        if (usuario) {
          const updateData = {};
          if (dadosUsuario.login) updateData.login = dadosUsuario.login;
          if (dadosUsuario.senha) updateData.senha = dadosUsuario.senha;
          if (Object.keys(updateData).length > 0) {
            await usuario.update(updateData, { transaction });
          }
        }
      }

      await transaction.commit();
      return await this.buscarPorId(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async deletar(id) {
    const transaction = await sequelize.transaction();
    try {
      const aluno = await Aluno.findByPk(id);
      if (!aluno) return false;

      const idUsuario = aluno.id_usuario;
      await aluno.destroy({ transaction });
      await Usuario.destroy({ where: { id_usuario: idUsuario }, transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new AlunoDAO();
