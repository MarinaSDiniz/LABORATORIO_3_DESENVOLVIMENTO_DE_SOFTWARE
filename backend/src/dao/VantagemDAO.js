const { Vantagem, EmpresaParceira } = require('../models');

const includeEmpresa = [{ model: EmpresaParceira, as: 'empresa', attributes: ['id_empresa', 'nome'] }];

class VantagemDAO {
  listarAtivas() {
    return Vantagem.findAll({ where: { ativa: true }, include: includeEmpresa, order: [['custo_moedas', 'ASC']] });
  }

  listarPorEmpresa(id_empresa) {
    return Vantagem.findAll({ where: { id_empresa }, order: [['createdAt', 'DESC']] });
  }

  buscarPorId(id) {
    return Vantagem.findByPk(id, { include: includeEmpresa });
  }

  criar(dados) {
    return Vantagem.create(dados);
  }

  async atualizar(vantagem, dados) {
    return vantagem.update(dados);
  }

  async remover(vantagem) {
    // Exclusão lógica para preservar o histórico dos resgates
    return vantagem.update({ ativa: false });
  }
}

module.exports = new VantagemDAO();
