const { EmpresaParceira, Usuario, sequelize } = require('../models');

// Padrão DAO / Repository para Empresa Parceira
class EmpresaParceiraDAO {
  async listarTodas() {
    return await EmpresaParceira.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'login', 'tipo_perfil'] }
      ],
      order: [['id_empresa', 'DESC']]
    });
  }

  async buscarPorId(id) {
    return await EmpresaParceira.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'login', 'tipo_perfil'] }
      ]
    });
  }

  async buscarPorEmail(email, ignorarId = null) {
    const { Op } = require('sequelize');
    const where = { email };
    if (ignorarId) {
      where.id_empresa = { [Op.ne]: ignorarId };
    }
    return await EmpresaParceira.findOne({ where });
  }

  async criar(dadosEmpresa, dadosUsuario) {
    const transaction = await sequelize.transaction();
    try {
      const usuario = await Usuario.create({
        login: dadosUsuario.login || dadosEmpresa.email,
        senha: dadosUsuario.senha,
        tipo_perfil: 'EMPRESA'
      }, { transaction });

      const empresa = await EmpresaParceira.create({
        nome: dadosEmpresa.nome,
        email: dadosEmpresa.email,
        cnpj: dadosEmpresa.cnpj || null,
        id_usuario: usuario.id_usuario
      }, { transaction });

      await transaction.commit();
      return await this.buscarPorId(empresa.id_empresa);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async atualizar(id, dadosEmpresa, dadosUsuario) {
    const transaction = await sequelize.transaction();
    try {
      const empresa = await EmpresaParceira.findByPk(id);
      if (!empresa) return null;

      await empresa.update({
        nome: dadosEmpresa.nome,
        email: dadosEmpresa.email,
        cnpj: dadosEmpresa.cnpj !== undefined ? dadosEmpresa.cnpj : empresa.cnpj
      }, { transaction });

      if (dadosUsuario) {
        const usuario = await Usuario.findByPk(empresa.id_usuario);
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
      const empresa = await EmpresaParceira.findByPk(id);
      if (!empresa) return false;

      const idUsuario = empresa.id_usuario;
      await empresa.destroy({ transaction });
      await Usuario.destroy({ where: { id_usuario: idUsuario }, transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new EmpresaParceiraDAO();
