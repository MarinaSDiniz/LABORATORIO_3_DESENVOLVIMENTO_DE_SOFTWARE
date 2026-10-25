const VantagemDAO = require('../dao/VantagemDAO');
const TransacaoDAO = require('../dao/TransacaoDAO');

function tratarErro(res, error, msg) {
  if (error.status) return res.status(error.status).json({ error: error.message });
  console.error(msg, error);
  return res.status(500).json({ error: msg });
}

function validarDados({ nome, descricao, foto, custo_moedas }, parcial = false) {
  if (!parcial || nome !== undefined) if (!nome || !String(nome).trim()) return 'Informe o nome da vantagem.';
  if (!parcial || descricao !== undefined) if (!descricao || !String(descricao).trim()) return 'Informe a descrição.';
  if (!parcial || foto !== undefined) if (!foto) return 'A foto do produto é obrigatória.';
  if (!parcial || custo_moedas !== undefined) {
    const c = parseInt(custo_moedas, 10);
    if (!Number.isInteger(c) || c <= 0) return 'O custo em moedas deve ser um inteiro maior que zero.';
  }
  return null;
}

class VantagemController {
  // Catálogo visível para alunos
  async listar(req, res) {
    try { return res.json(await VantagemDAO.listarAtivas()); }
    catch (e) { return tratarErro(res, e, 'Erro ao listar vantagens.'); }
  }

  async minhas(req, res) {
    try { return res.json(await VantagemDAO.listarPorEmpresa(req.auth.id_entidade)); }
    catch (e) { return tratarErro(res, e, 'Erro ao listar vantagens.'); }
  }

  // US07 - cadastrar vantagem com descrição, foto e custo
  async criar(req, res) {
    try {
      const erro = validarDados(req.body);
      if (erro) return res.status(400).json({ error: erro });
      const { nome, descricao, foto, custo_moedas } = req.body;
      const v = await VantagemDAO.criar({
        nome: nome.trim(), descricao: descricao.trim(), foto,
        custo_moedas: parseInt(custo_moedas, 10), id_empresa: req.auth.id_entidade
      });
      return res.status(201).json(v);
    } catch (e) { return tratarErro(res, e, 'Erro ao cadastrar vantagem.'); }
  }

  async atualizar(req, res) {
    try {
      const v = await VantagemDAO.buscarPorId(req.params.id);
      if (!v || v.id_empresa !== req.auth.id_entidade) return res.status(404).json({ error: 'Vantagem não encontrada.' });
      const erro = validarDados(req.body, true);
      if (erro) return res.status(400).json({ error: erro });
      const dados = {};
      ['nome', 'descricao', 'foto', 'ativa'].forEach(k => { if (req.body[k] !== undefined) dados[k] = req.body[k]; });
      if (req.body.custo_moedas !== undefined) dados.custo_moedas = parseInt(req.body.custo_moedas, 10);
      return res.json(await VantagemDAO.atualizar(v, dados));
    } catch (e) { return tratarErro(res, e, 'Erro ao atualizar vantagem.'); }
  }

  async remover(req, res) {
    try {
      const v = await VantagemDAO.buscarPorId(req.params.id);
      if (!v || v.id_empresa !== req.auth.id_entidade) return res.status(404).json({ error: 'Vantagem não encontrada.' });
      await VantagemDAO.remover(v);
      return res.json({ message: 'Vantagem removida do catálogo.' });
    } catch (e) { return tratarErro(res, e, 'Erro ao remover vantagem.'); }
  }

  // US08 - resgates recebidos e conferência de cupom
  async resgates(req, res) {
    try { return res.json(await TransacaoDAO.resgatesEmpresa(req.auth.id_entidade)); }
    catch (e) { return tratarErro(res, e, 'Erro ao listar resgates.'); }
  }

  async validarCupom(req, res) {
    try {
      if (!req.body.codigo) return res.status(400).json({ error: 'Informe o código do cupom.' });
      const t = await TransacaoDAO.validarCupom(req.auth.id_entidade, req.body.codigo);
      return res.json({ message: `Cupom válido! ${t.aluno.nome} — ${t.vantagem.nome}. Troca confirmada.`, transacao: t });
    } catch (e) { return tratarErro(res, e, 'Erro ao validar cupom.'); }
  }
}

module.exports = new VantagemController();
