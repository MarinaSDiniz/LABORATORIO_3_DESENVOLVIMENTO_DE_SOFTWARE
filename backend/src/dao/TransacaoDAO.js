const crypto = require('crypto');
const { sequelize, Transacao, Aluno, Professor, Vantagem, EmpresaParceira } = require('../models');
const ProfessorDAO = require('./ProfessorDAO');

class ErroNegocio extends Error {
  constructor(msg, status = 400) { super(msg); this.status = status; }
}

function gerarCodigoCupom() {
  return `ME-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

class TransacaoDAO {
  // US05 - professor envia moedas para aluno
  async enviarMoedas(id_professor, id_aluno, valor, motivo) {
    return sequelize.transaction(async (t) => {
      const professor = await Professor.findByPk(id_professor, { transaction: t });
      if (!professor) throw new ErroNegocio('Professor não encontrado.', 404);
      await ProfessorDAO.garantirCreditoSemestral(professor, t);

      const aluno = await Aluno.findByPk(id_aluno, { transaction: t });
      if (!aluno) throw new ErroNegocio('Aluno não encontrado.', 404);
      if (aluno.id_instituicao !== professor.id_instituicao) {
        throw new ErroNegocio('O aluno não pertence à sua instituição de ensino.');
      }
      if (professor.saldo_moedas < valor) {
        throw new ErroNegocio(`Saldo insuficiente. Você possui ${professor.saldo_moedas} moedas.`);
      }

      professor.saldo_moedas -= valor;
      aluno.saldo_moedas += valor;
      await professor.save({ transaction: t });
      await aluno.save({ transaction: t });

      const transacao = await Transacao.create({ tipo: 'ENVIO', valor, motivo, id_aluno, id_professor }, { transaction: t });
      return { transacao, professor, aluno };
    });
  }

  // US03 - aluno troca moedas por vantagem
  async resgatarVantagem(id_aluno, id_vantagem) {
    return sequelize.transaction(async (t) => {
      const aluno = await Aluno.findByPk(id_aluno, { transaction: t });
      if (!aluno) throw new ErroNegocio('Aluno não encontrado.', 404);

      const vantagem = await Vantagem.findByPk(id_vantagem, {
        include: [{ model: EmpresaParceira, as: 'empresa' }], transaction: t
      });
      if (!vantagem || !vantagem.ativa) throw new ErroNegocio('Vantagem não encontrada ou indisponível.', 404);
      if (aluno.saldo_moedas < vantagem.custo_moedas) {
        throw new ErroNegocio(`Saldo insuficiente. Você possui ${aluno.saldo_moedas} e a vantagem custa ${vantagem.custo_moedas} moedas.`);
      }

      aluno.saldo_moedas -= vantagem.custo_moedas;
      await aluno.save({ transaction: t });

      const transacao = await Transacao.create({
        tipo: 'RESGATE',
        valor: vantagem.custo_moedas,
        motivo: `Resgate: ${vantagem.nome}`,
        codigo_cupom: gerarCodigoCupom(),
        id_aluno,
        id_vantagem: vantagem.id_vantagem,
        id_empresa: vantagem.id_empresa
      }, { transaction: t });

      return { transacao, aluno, vantagem };
    });
  }

  extratoAluno(id_aluno) {
    return Transacao.findAll({
      where: { id_aluno },
      include: [
        { model: Professor, as: 'professor', attributes: ['id_professor', 'nome'] },
        { model: Vantagem, as: 'vantagem', attributes: ['id_vantagem', 'nome', 'foto'] },
        { model: EmpresaParceira, as: 'empresa', attributes: ['id_empresa', 'nome'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  extratoProfessor(id_professor) {
    return Transacao.findAll({
      where: { id_professor, tipo: 'ENVIO' },
      include: [{ model: Aluno, as: 'aluno', attributes: ['id_aluno', 'nome', 'curso'] }],
      order: [['createdAt', 'DESC']]
    });
  }

  resgatesEmpresa(id_empresa) {
    return Transacao.findAll({
      where: { id_empresa, tipo: 'RESGATE' },
      include: [
        { model: Aluno, as: 'aluno', attributes: ['id_aluno', 'nome', 'email'] },
        { model: Vantagem, as: 'vantagem', attributes: ['id_vantagem', 'nome'] }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  // US08 - empresa confere o código do cupom presencialmente
  async validarCupom(id_empresa, codigo) {
    const transacao = await Transacao.findOne({
      where: { codigo_cupom: String(codigo).trim().toUpperCase(), id_empresa },
      include: [
        { model: Aluno, as: 'aluno', attributes: ['nome', 'email'] },
        { model: Vantagem, as: 'vantagem', attributes: ['nome'] }
      ]
    });
    if (!transacao) throw new ErroNegocio('Cupom não encontrado para esta empresa.', 404);
    if (transacao.cupom_utilizado) throw new ErroNegocio('Este cupom já foi utilizado.');
    transacao.cupom_utilizado = true;
    await transacao.save();
    return transacao;
  }
}

module.exports = new TransacaoDAO();
module.exports.ErroNegocio = ErroNegocio;
