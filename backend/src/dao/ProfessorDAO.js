const { Professor, Usuario, InstituicaoEnsino } = require('../models');

const CREDITO_SEMESTRAL = 1000;

function semestreAtual(data = new Date()) {
  return `${data.getFullYear()}-${data.getMonth() < 6 ? 1 : 2}`;
}

class ProfessorDAO {
  async buscarPorId(id) {
    const professor = await Professor.findByPk(id, {
      include: [
        { model: Usuario, as: 'usuario', attributes: ['id_usuario', 'login', 'tipo_perfil'] },
        { model: InstituicaoEnsino, as: 'instituicao', attributes: ['id_instituicao', 'nome'] }
      ]
    });
    if (professor) await this.garantirCreditoSemestral(professor);
    return professor;
  }

  // Regra de negócio: a cada semestre o professor recebe 1.000 moedas, acumuláveis.
  async garantirCreditoSemestral(professor, transaction) {
    const atual = semestreAtual();
    if (professor.semestre_ultimo_credito !== atual) {
      professor.saldo_moedas += CREDITO_SEMESTRAL;
      professor.semestre_ultimo_credito = atual;
      await professor.save({ transaction });
    }
    return professor;
  }

  async criar(dados, senha, transaction) {
    const usuario = await Usuario.create({ login: dados.email, senha, tipo_perfil: 'PROFESSOR' }, { transaction });
    return Professor.create({ ...dados, id_usuario: usuario.id_usuario }, { transaction });
  }
}

module.exports = new ProfessorDAO();
module.exports.semestreAtual = semestreAtual;
module.exports.CREDITO_SEMESTRAL = CREDITO_SEMESTRAL;
