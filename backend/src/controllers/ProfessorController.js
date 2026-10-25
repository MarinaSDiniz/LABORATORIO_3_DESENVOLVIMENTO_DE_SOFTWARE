const { Aluno } = require('../models');
const ProfessorDAO = require('../dao/ProfessorDAO');
const TransacaoDAO = require('../dao/TransacaoDAO');
const { enviarEmail } = require('../services/EmailService');

function tratarErro(res, error, msg) {
  if (error.status) return res.status(error.status).json({ error: error.message });
  console.error(msg, error);
  return res.status(500).json({ error: msg });
}

class ProfessorController {
  // US06 - saldo disponível
  async meusDados(req, res) {
    try {
      const professor = await ProfessorDAO.buscarPorId(req.auth.id_entidade);
      if (!professor) return res.status(404).json({ error: 'Professor não encontrado.' });
      return res.json(professor);
    } catch (e) { return tratarErro(res, e, 'Erro ao buscar dados do professor.'); }
  }

  // US06 - histórico de envios
  async extrato(req, res) {
    try {
      const professor = await ProfessorDAO.buscarPorId(req.auth.id_entidade);
      const transacoes = await TransacaoDAO.extratoProfessor(req.auth.id_entidade);
      const totalEnviado = transacoes.reduce((s, t) => s + t.valor, 0);
      return res.json({ saldo: professor.saldo_moedas, total_enviado: totalEnviado, transacoes });
    } catch (e) { return tratarErro(res, e, 'Erro ao consultar extrato.'); }
  }

  // Alunos da mesma instituição (destinatários possíveis)
  async alunos(req, res) {
    try {
      const professor = await ProfessorDAO.buscarPorId(req.auth.id_entidade);
      const alunos = await Aluno.findAll({
        where: { id_instituicao: professor.id_instituicao },
        attributes: ['id_aluno', 'nome', 'email', 'curso'],
        order: [['nome', 'ASC']]
      });
      return res.json(alunos);
    } catch (e) { return tratarErro(res, e, 'Erro ao listar alunos.'); }
  }

  // US05 - enviar moedas com motivo obrigatório
  async enviarMoedas(req, res) {
    try {
      const id_aluno = parseInt(req.body.id_aluno, 10);
      const valor = parseInt(req.body.valor, 10);
      const motivo = (req.body.motivo || '').trim();

      if (!id_aluno) return res.status(400).json({ error: 'Selecione o aluno.' });
      if (!Number.isInteger(valor) || valor <= 0) return res.status(400).json({ error: 'Informe um valor inteiro maior que zero.' });
      if (!motivo) return res.status(400).json({ error: 'O motivo do reconhecimento é obrigatório.' });

      const { transacao, professor, aluno } = await TransacaoDAO.enviarMoedas(req.auth.id_entidade, id_aluno, valor, motivo);

      await enviarEmail({
        para: aluno.email,
        id_usuario: aluno.id_usuario,
        assunto: `Você recebeu ${valor} moedas!`,
        html: `<p>Olá, <b>${aluno.nome}</b>!</p>
               <p>O(a) professor(a) <b>${professor.nome}</b> enviou <b>${valor} moedas</b> para você.</p>
               <p><i>Motivo:</i> ${motivo}</p>
               <p>Seu novo saldo é de <b>${aluno.saldo_moedas} moedas</b>.</p>`
      });

      return res.status(201).json({ message: 'Moedas enviadas com sucesso!', transacao, saldo: professor.saldo_moedas });
    } catch (e) { return tratarErro(res, e, 'Erro ao enviar moedas.'); }
  }
}

module.exports = new ProfessorController();
