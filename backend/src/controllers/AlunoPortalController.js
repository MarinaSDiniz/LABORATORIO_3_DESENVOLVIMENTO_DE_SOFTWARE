const { Notificacao } = require('../models');
const AlunoDAO = require('../dao/AlunoDAO');
const TransacaoDAO = require('../dao/TransacaoDAO');
const { enviarEmail } = require('../services/EmailService');

function tratarErro(res, error, msg) {
  if (error.status) return res.status(error.status).json({ error: error.message });
  console.error(msg, error);
  return res.status(500).json({ error: msg });
}

class AlunoPortalController {
  async meusDados(req, res) {
    try {
      const aluno = await AlunoDAO.buscarPorId(req.auth.id_entidade);
      if (!aluno) return res.status(404).json({ error: 'Aluno não encontrado.' });
      return res.json(aluno);
    } catch (e) { return tratarErro(res, e, 'Erro ao buscar dados do aluno.'); }
  }

  // US02 - extrato com saldo, recebimentos e trocas
  async extrato(req, res) {
    try {
      const aluno = await AlunoDAO.buscarPorId(req.auth.id_entidade);
      const transacoes = await TransacaoDAO.extratoAluno(req.auth.id_entidade);
      const recebido = transacoes.filter(t => t.tipo === 'ENVIO').reduce((s, t) => s + t.valor, 0);
      const gasto = transacoes.filter(t => t.tipo === 'RESGATE').reduce((s, t) => s + t.valor, 0);
      return res.json({ saldo: aluno.saldo_moedas, total_recebido: recebido, total_resgatado: gasto, transacoes });
    } catch (e) { return tratarErro(res, e, 'Erro ao consultar extrato.'); }
  }

  // US03 + US04 + US08 - troca por vantagem e notificações por e-mail
  async resgatar(req, res) {
    try {
      const id_vantagem = parseInt(req.body.id_vantagem, 10);
      if (!id_vantagem) return res.status(400).json({ error: 'Informe a vantagem.' });

      const { transacao, aluno, vantagem } = await TransacaoDAO.resgatarVantagem(req.auth.id_entidade, id_vantagem);
      const codigo = transacao.codigo_cupom;

      // US04 - e-mail ao aluno com o cupom
      await enviarEmail({
        para: aluno.email,
        id_usuario: aluno.id_usuario,
        assunto: `Seu cupom: ${vantagem.nome}`,
        html: `<p>Olá, <b>${aluno.nome}</b>!</p>
               <p>Você resgatou <b>${vantagem.nome}</b> da empresa <b>${vantagem.empresa.nome}</b> por ${vantagem.custo_moedas} moedas.</p>
               <p>Apresente o código abaixo na empresa parceira:</p>
               <h2 style="letter-spacing:3px">${codigo}</h2>`
      });

      // US08 - e-mail ao parceiro com o mesmo código para conferência
      await enviarEmail({
        para: vantagem.empresa.email,
        id_usuario: vantagem.empresa.id_usuario,
        assunto: `Novo resgate: ${vantagem.nome}`,
        html: `<p>O aluno <b>${aluno.nome}</b> (${aluno.email}) resgatou a vantagem <b>${vantagem.nome}</b>.</p>
               <p>Código para conferência na troca presencial:</p>
               <h2 style="letter-spacing:3px">${codigo}</h2>`
      });

      return res.status(201).json({ message: 'Vantagem resgatada! O cupom foi enviado para seu e-mail.', codigo_cupom: codigo, saldo: aluno.saldo_moedas });
    } catch (e) { return tratarErro(res, e, 'Erro ao resgatar vantagem.'); }
  }

  // Caixa de e-mails do usuário logado (qualquer perfil)
  async notificacoes(req, res) {
    try {
      const lista = await Notificacao.findAll({ where: { id_usuario: req.auth.id_usuario }, order: [['createdAt', 'DESC']] });
      return res.json(lista);
    } catch (e) { return tratarErro(res, e, 'Erro ao buscar notificações.'); }
  }
}

module.exports = new AlunoPortalController();
