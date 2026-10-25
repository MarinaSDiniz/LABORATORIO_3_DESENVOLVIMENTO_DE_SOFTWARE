const API = location.port === '3001' ? '/api' : 'http://localhost:3001/api';
const sessao = {
  get token() { return localStorage.getItem('me_token'); },
  get dados() { return JSON.parse(localStorage.getItem('me_sessao') || 'null'); },
  salvar(d) { localStorage.setItem('me_token', d.token); localStorage.setItem('me_sessao', JSON.stringify(d)); },
  limpar() { localStorage.removeItem('me_token'); localStorage.removeItem('me_sessao'); }
};

// ================= Utilitários =================
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtData = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const fmtNum = (n) => Number(n || 0).toLocaleString('pt-BR');

async function api(caminho, opcoes = {}) {
  const res = await fetch(API + caminho, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', ...(sessao.token ? { Authorization: `Bearer ${sessao.token}` } : {}) },
    body: opcoes.body ? JSON.stringify(opcoes.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && sessao.token) { sessao.limpar(); mostrarAcesso(); }
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

function toast(msg, erro = false) {
  const el = document.createElement('div');
  el.className = `toast ${erro ? 'erro' : ''}`;
  el.textContent = msg;
  $('#toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4500);
}

function abrirModal(titulo, html) {
  $('#modal-titulo').textContent = titulo;
  $('#modal-corpo').innerHTML = html;
  $('#modal').classList.add('open');
}
function fecharModal() { $('#modal').classList.remove('open'); }

async function comBotao(btn, fn) {
  btn.disabled = true;
  try { await fn(); } catch (e) { toast(e.message, true); } finally { btn.disabled = false; }
}

function mascaraCpf(input) {
  input.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    e.target.value = v;
  });
}

// Redimensiona imagem para no máximo 800px e converte para Data URL (JPEG)
function lerImagem(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, 800 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = img.width * escala; c.height = img.height * escala;
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ================= Acesso (login / cadastros) =================
document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === t.dataset.tab));
}));

$('#form-login').addEventListener('submit', (e) => {
  e.preventDefault();
  comBotao($('#btn-login'), async () => {
    const d = await api('/auth/login', { method: 'POST', body: { login: $('#login-email').value, senha: $('#login-senha').value } });
    sessao.salvar(d);
    iniciarApp();
  });
});

// US01 - auto-cadastro do aluno
$('#form-cad-aluno').addEventListener('submit', (e) => {
  e.preventDefault();
  comBotao($('#btn-cad-aluno'), async () => {
    const body = {
      nome: $('#ca-nome').value.trim(), email: $('#ca-email').value.trim(), cpf: $('#ca-cpf').value.trim(),
      rg: $('#ca-rg').value.trim(), endereco: $('#ca-endereco').value.trim(), curso: $('#ca-curso').value.trim(),
      id_instituicao: parseInt($('#ca-instituicao').value, 10), senha: $('#ca-senha').value
    };
    await api('/alunos', { method: 'POST', body });
    const d = await api('/auth/login', { method: 'POST', body: { login: body.email, senha: body.senha } });
    sessao.salvar(d);
    toast('Conta criada com sucesso! Bem-vindo(a) 🎉');
    iniciarApp();
  });
});

$('#form-cad-empresa').addEventListener('submit', (e) => {
  e.preventDefault();
  comBotao($('#btn-cad-empresa'), async () => {
    const body = { nome: $('#ce-nome').value.trim(), email: $('#ce-email').value.trim(), cnpj: $('#ce-cnpj').value.trim() || null, senha: $('#ce-senha').value };
    await api('/empresas', { method: 'POST', body });
    const d = await api('/auth/login', { method: 'POST', body: { login: body.email, senha: body.senha } });
    sessao.salvar(d);
    toast('Empresa cadastrada! Agora cadastre suas vantagens.');
    iniciarApp();
  });
});

async function carregarInstituicoes() {
  try {
    const lista = await api('/instituicoes');
    $('#ca-instituicao').innerHTML = '<option value="">Selecione...</option>' +
      lista.map(i => `<option value="${i.id_instituicao}">${esc(i.nome)}</option>`).join('');
  } catch { /* backend offline */ }
}

function mostrarAcesso() {
  $('#tela-app').classList.add('hidden');
  $('#tela-acesso').classList.remove('hidden');
}

$('#btn-logout').addEventListener('click', () => { sessao.limpar(); mostrarAcesso(); });
$('#modal-fechar').addEventListener('click', fecharModal);
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') fecharModal(); });

// ================= App por perfil =================
const MENUS = {
  ALUNO: [['inicio', '🏠 Início'], ['vantagens', '🎁 Vantagens'], ['extrato', '📜 Extrato'], ['emails', '📧 E-mails']],
  PROFESSOR: [['enviar', '<img src="img/coin.png" class="coin-icon" alt=""> Enviar moedas'], ['extrato', '📜 Extrato'], ['emails', '📧 E-mails']],
  EMPRESA: [['minhas', '🎁 Minhas vantagens'], ['resgates', '🎟️ Resgates'], ['emails', '📧 E-mails']]
};
const ROTULO = { ALUNO: 'ALUNO', PROFESSOR: 'PROFESSOR', EMPRESA: 'EMPRESA PARCEIRA' };

async function iniciarApp() {
  const s = sessao.dados;
  if (!s) return mostrarAcesso();
  try { await api('/auth/me'); } catch { return; }

  $('#tela-acesso').classList.add('hidden');
  $('#tela-app').classList.remove('hidden');
  $('#user-nome').textContent = s.nome;
  $('#user-perfil').textContent = ROTULO[s.perfil];

  const menu = MENUS[s.perfil];
  $('#menu').innerHTML = menu.map(([id, txt]) => `<button data-view="${id}" id="menu-${id}">${txt}</button>`).join('');
  $('#menu').querySelectorAll('button').forEach(b => b.addEventListener('click', () => navegar(b.dataset.view)));
  navegar(menu[0][0]);
}

function navegar(view) {
  $('#menu').querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  const conteudo = $('#conteudo');
  conteudo.style.animation = 'none'; conteudo.offsetHeight; conteudo.style.animation = '';
  conteudo.innerHTML = '<p class="vazio">Carregando...</p>';
  const fn = VIEWS[sessao.dados.perfil][view] || VIEWS.comum[view];
  fn(conteudo).catch(e => { conteudo.innerHTML = `<p class="vazio">${esc(e.message)}</p>`; });
}

// ---------- Componentes ----------
const stat = (label, valor, destaque = false) =>
  `<div class="card stat ${destaque ? 'destaque' : ''}"><div class="label">${label}</div><div class="valor">${valor}</div></div>`;

function itemTransacaoAluno(t) {
  if (t.tipo === 'ENVIO') {
    return `<div class="item"><div class="icone in">⬇️</div>
      <div class="info"><strong>Recebido de ${esc(t.professor?.nome || 'Professor')}</strong>
      <small>${esc(t.motivo)} · ${fmtData(t.createdAt)}</small></div>
      <span class="valor-in">+${fmtNum(t.valor)}</span></div>`;
  }
  return `<div class="item"><div class="icone out">🎁</div>
    <div class="info"><strong>${esc(t.vantagem?.nome || 'Vantagem')} <small>· ${esc(t.empresa?.nome || '')}</small></strong>
    <small>Cupom <span class="cupom">${esc(t.codigo_cupom)}</span> ${t.cupom_utilizado ? '✅ utilizado' : '⏳ disponível'} · ${fmtData(t.createdAt)}</small></div>
    <span class="valor-out">−${fmtNum(t.valor)}</span></div>`;
}

const listaOuVazio = (itens, render, msg) => itens.length ? `<div class="lista">${itens.map(render).join('')}</div>` : `<p class="vazio">${msg}</p>`;

// ================= Views =================
const VIEWS = {
  comum: {
    async emails(el) {
      const lista = await api('/notificacoes/me');
      el.innerHTML = `<div class="page-title"><h2>Caixa de e-mails</h2><p>Notificações enviadas pelo sistema para ${esc(sessao.dados.nome)}.</p></div>
        <div class="card">${listaOuVazio(lista, (n, i) => `
          <div class="item email" data-i="${i}"><div class="icone in">📧</div>
          <div class="info"><strong>${esc(n.assunto)}</strong><small>Para ${esc(n.destinatario)} · ${fmtData(n.createdAt)}</small></div>
          <span class="pill">${n.enviado_smtp ? 'SMTP' : 'registrado'}</span></div>`, 'Nenhum e-mail recebido ainda.')}</div>`;
      el.querySelectorAll('.email').forEach(it => it.addEventListener('click', () => {
        const n = lista[it.dataset.i];
        // corpo gerado pelo servidor com dados escapados na origem — exibido em iframe isolado
        abrirModal(n.assunto, `<iframe sandbox style="width:100%;height:320px;border:0;border-radius:10px;background:#fff" srcdoc="${esc(n.corpo)}"></iframe>`);
      }));
    }
  },

  // ---------------- ALUNO ----------------
  ALUNO: {
    async inicio(el) {
      const [ext, aluno] = await Promise.all([api('/alunos/me/extrato'), api('/alunos/me')]);
      el.innerHTML = `<div class="page-title"><h2>Olá, ${esc(aluno.nome.split(' ')[0])} 👋</h2>
        <p>${esc(aluno.curso)} · ${esc(aluno.instituicao?.nome)}</p></div>
        <div class="stats">${stat('Saldo atual', `<img src="img/coin.png" class="coin-icon" alt=""> ${fmtNum(ext.saldo)}`, true)}${stat('Total recebido', fmtNum(ext.total_recebido))}${stat('Total trocado', fmtNum(ext.total_resgatado))}</div>
        <div class="card"><h3>Últimas movimentações</h3>${listaOuVazio(ext.transacoes.slice(0, 5), itemTransacaoAluno, 'Você ainda não recebeu moedas.')}</div>`;
    },

    // US03
    async vantagens(el) {
      const [lista, ext] = await Promise.all([api('/vantagens'), api('/alunos/me/extrato')]);
      let saldo = ext.saldo;
      el.innerHTML = `<div class="page-title"><h2>Vantagens disponíveis</h2><p>Seu saldo: <span class="preco"><img src="img/coin.png" class="coin-icon" alt=""> <span id="saldo-vitrine">${fmtNum(saldo)}</span></span></p></div>
        ${lista.length ? `<div class="vitrine">${lista.map(v => `
          <article class="card vantagem">
            <img src="${esc(v.foto)}" alt="${esc(v.nome)}" loading="lazy">
            <div class="corpo"><span class="empresa">${esc(v.empresa?.nome)}</span><strong>${esc(v.nome)}</strong><p>${esc(v.descricao)}</p>
            <div class="rodape"><span class="preco"><img src="img/coin.png" class="coin-icon" alt=""> ${fmtNum(v.custo_moedas)}</span>
            <button class="btn btn-gold btn-sm btn-resgatar" id="btn-resgatar-${v.id_vantagem}" data-id="${v.id_vantagem}" data-custo="${v.custo_moedas}" data-nome="${esc(v.nome)}">Trocar</button></div></div>
          </article>`).join('')}</div>` : '<p class="vazio card">Nenhuma vantagem cadastrada pelas empresas parceiras ainda.</p>'}`;

      const atualizarBotoes = () => el.querySelectorAll('.btn-resgatar').forEach(b => { b.disabled = saldo < Number(b.dataset.custo); });
      atualizarBotoes();
      el.querySelectorAll('.btn-resgatar').forEach(b => b.addEventListener('click', () => {
        abrirModal('Confirmar troca', `<p>Trocar <b>${fmtNum(b.dataset.custo)} moedas</b> por <b>${b.dataset.nome}</b>?</p>
          <p class="hint" style="text-align:left;margin:10px 0 18px">Você receberá um e-mail com o código do cupom para apresentar na empresa.</p>
          <button class="btn btn-gold btn-block" id="btn-confirmar-resgate">Confirmar troca</button>`);
        $('#btn-confirmar-resgate').addEventListener('click', (e) => comBotao(e.target, async () => {
          const r = await api('/alunos/me/resgates', { method: 'POST', body: { id_vantagem: Number(b.dataset.id) } });
          saldo = r.saldo;
          $('#saldo-vitrine').textContent = fmtNum(saldo);
          atualizarBotoes();
          abrirModal('Troca realizada! 🎉', `<p>${esc(r.message)}</p><p style="text-align:center;margin:20px 0"><span class="cupom" style="font-size:1.6rem">${esc(r.codigo_cupom)}</span></p>`);
        }));
      }));
    },

    // US02
    async extrato(el) {
      const ext = await api('/alunos/me/extrato');
      el.innerHTML = `<div class="page-title"><h2>Extrato</h2><p>Histórico completo de recebimentos e trocas.</p></div>
        <div class="stats">${stat('Saldo atual', `<img src="img/coin.png" class="coin-icon" alt=""> ${fmtNum(ext.saldo)}`, true)}${stat('Recebido', fmtNum(ext.total_recebido))}${stat('Trocado', fmtNum(ext.total_resgatado))}</div>
        <div class="card">${listaOuVazio(ext.transacoes, itemTransacaoAluno, 'Nenhuma movimentação.')}</div>`;
    }
  },

  // ---------------- PROFESSOR ----------------
  PROFESSOR: {
    // US05
    async enviar(el) {
      const [prof, alunos, ext] = await Promise.all([api('/professores/me'), api('/professores/me/alunos'), api('/professores/me/extrato')]);
      el.innerHTML = `<div class="page-title"><h2>Reconhecer mérito</h2><p>${esc(prof.departamento)} · ${esc(prof.instituicao?.nome)}</p></div>
        <div class="stats">${stat('Saldo disponível', `<img src="img/coin.png" class="coin-icon" alt=""> <span id="saldo-prof">${fmtNum(prof.saldo_moedas)}</span>`, true)}${stat('Total já distribuído', fmtNum(ext.total_enviado))}${stat('Reconhecimentos', ext.transacoes.length)}</div>
        <div class="grid-main">
          <form class="card form-card" id="form-envio"><h3>Enviar moedas</h3>
            <label>Aluno<select id="envio-aluno" required><option value="">Selecione o aluno...</option>
              ${alunos.map(a => `<option value="${a.id_aluno}">${esc(a.nome)} — ${esc(a.curso)}</option>`).join('')}</select></label>
            <label>Quantidade de moedas<input id="envio-valor" type="number" min="1" step="1" required></label>
            <label>Motivo (obrigatório)<textarea id="envio-motivo" required placeholder="Ex.: Excelente participação no seminário de arquitetura."></textarea></label>
            <button class="btn btn-primary" id="btn-enviar" type="submit">Enviar moedas</button>
            ${alunos.length ? '' : '<p class="hint">Nenhum aluno cadastrado na sua instituição ainda.</p>'}
          </form>
          <div class="card"><h3>Envios recentes</h3><div id="envios-recentes"></div></div>
        </div>`;
      const renderRecentes = (lista) => { $('#envios-recentes').innerHTML = listaOuVazio(lista.slice(0, 6), itemEnvio, 'Nenhum envio ainda.'); };
      renderRecentes(ext.transacoes);

      $('#form-envio').addEventListener('submit', (e) => {
        e.preventDefault();
        comBotao($('#btn-enviar'), async () => {
          const r = await api('/professores/me/envios', { method: 'POST', body: {
            id_aluno: Number($('#envio-aluno').value), valor: Number($('#envio-valor').value), motivo: $('#envio-motivo').value
          } });
          toast(r.message);
          $('#form-envio').reset();
          $('#saldo-prof').textContent = fmtNum(r.saldo);
          renderRecentes((await api('/professores/me/extrato')).transacoes);
        });
      });
    },

    // US06
    async extrato(el) {
      const ext = await api('/professores/me/extrato');
      el.innerHTML = `<div class="page-title"><h2>Extrato</h2><p>Você recebe 1.000 moedas por semestre (saldo acumulável).</p></div>
        <div class="stats">${stat('Saldo disponível', `<img src="img/coin.png" class="coin-icon" alt=""> ${fmtNum(ext.saldo)}`, true)}${stat('Total distribuído', fmtNum(ext.total_enviado))}</div>
        <div class="card">${listaOuVazio(ext.transacoes, itemEnvio, 'Nenhum envio realizado.')}</div>`;
    }
  },

  // ---------------- EMPRESA ----------------
  EMPRESA: {
    // US07
    async minhas(el) {
      const lista = (await api('/empresas/me/vantagens')).filter(v => v.ativa);
      el.innerHTML = `<div class="page-title" style="display:flex;justify-content:space-between;align-items:end;gap:12px;flex-wrap:wrap">
          <div><h2>Minhas vantagens</h2><p>Ofertas visíveis para os alunos.</p></div>
          <button class="btn btn-primary" id="btn-nova-vantagem">+ Nova vantagem</button></div>
        ${lista.length ? `<div class="vitrine">${lista.map(v => `
          <article class="card vantagem"><img src="${esc(v.foto)}" alt="${esc(v.nome)}">
            <div class="corpo"><strong>${esc(v.nome)}</strong><p>${esc(v.descricao)}</p>
            <div class="rodape"><span class="preco"><img src="img/coin.png" class="coin-icon" alt=""> ${fmtNum(v.custo_moedas)}</span>
              <span><button class="btn btn-ghost btn-sm" data-edit="${v.id_vantagem}">Editar</button>
              <button class="btn btn-danger btn-sm" data-del="${v.id_vantagem}">Remover</button></span></div></div>
          </article>`).join('')}</div>` : '<p class="vazio card">Nenhuma vantagem cadastrada. Clique em "Nova vantagem".</p>'}`;

      $('#btn-nova-vantagem').addEventListener('click', () => modalVantagem(null, () => navegar('minhas')));
      el.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () =>
        modalVantagem(lista.find(v => v.id_vantagem == b.dataset.edit), () => navegar('minhas'))));
      el.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => comBotao(b, async () => {
        if (!confirm('Remover esta vantagem do catálogo?')) return;
        await api(`/vantagens/${b.dataset.del}`, { method: 'DELETE' });
        toast('Vantagem removida.');
        navegar('minhas');
      })));
    },

    // US08
    async resgates(el) {
      const lista = await api('/empresas/me/resgates');
      el.innerHTML = `<div class="page-title"><h2>Resgates</h2><p>Confira o código apresentado pelo aluno para validar a troca.</p></div>
        <div class="grid-main">
          <form class="card form-card" id="form-cupom"><h3>Validar cupom</h3>
            <label>Código do cupom<input id="cupom-codigo" required placeholder="ME-XXXXXXXX" style="text-transform:uppercase;letter-spacing:2px"></label>
            <button class="btn btn-gold" id="btn-validar" type="submit">Validar troca</button></form>
          <div class="card"><h3>Histórico de resgates</h3>${listaOuVazio(lista, t => `
            <div class="item"><div class="icone ${t.cupom_utilizado ? 'in' : 'out'}">${t.cupom_utilizado ? '✅' : '⏳'}</div>
            <div class="info"><strong>${esc(t.vantagem?.nome)}</strong><small>${esc(t.aluno?.nome)} · ${fmtData(t.createdAt)}</small></div>
            <span class="cupom">${esc(t.codigo_cupom)}</span></div>`, 'Nenhum resgate ainda.')}</div>
        </div>`;
      $('#form-cupom').addEventListener('submit', (e) => {
        e.preventDefault();
        comBotao($('#btn-validar'), async () => {
          const r = await api('/empresas/me/validar-cupom', { method: 'POST', body: { codigo: $('#cupom-codigo').value } });
          toast(r.message);
          navegar('resgates');
        });
      });
    }
  }
};

function itemEnvio(t) {
  return `<div class="item"><div class="icone out">⬆️</div>
    <div class="info"><strong>Para ${esc(t.aluno?.nome)}</strong><small>${esc(t.motivo)} · ${fmtData(t.createdAt)}</small></div>
    <span class="valor-out">−${fmtNum(t.valor)}</span></div>`;
}

function modalVantagem(v, aoSalvar) {
  abrirModal(v ? 'Editar vantagem' : 'Nova vantagem', `
    <form id="form-vantagem" class="form-card">
      <label>Nome<input id="v-nome" required value="${esc(v?.nome)}"></label>
      <label>Descrição<textarea id="v-descricao" required>${esc(v?.descricao)}</textarea></label>
      <label>Custo em moedas<input id="v-custo" type="number" min="1" step="1" required value="${v?.custo_moedas ?? ''}"></label>
      <label>Foto do produto<input id="v-foto-arquivo" type="file" accept="image/*"></label>
      <label>…ou URL da imagem<input id="v-foto-url" type="url" placeholder="https://..." value="${v && !v.foto.startsWith('data:') ? esc(v.foto) : ''}"></label>
      <img id="v-preview" class="preview-foto ${v ? '' : 'hidden'}" src="${esc(v?.foto || '')}" alt="Pré-visualização">
      <button class="btn btn-primary" id="btn-salvar-vantagem" type="submit">${v ? 'Salvar alterações' : 'Cadastrar vantagem'}</button>
    </form>`);
  let foto = v?.foto || '';
  const preview = $('#v-preview');
  $('#v-foto-arquivo').addEventListener('change', async (e) => {
    if (!e.target.files[0]) return;
    foto = await lerImagem(e.target.files[0]);
    preview.src = foto; preview.classList.remove('hidden');
  });
  $('#v-foto-url').addEventListener('input', (e) => { if (e.target.value) { foto = e.target.value; preview.src = foto; preview.classList.remove('hidden'); } });
  $('#form-vantagem').addEventListener('submit', (e) => {
    e.preventDefault();
    comBotao($('#btn-salvar-vantagem'), async () => {
      if (!foto) throw new Error('Adicione uma foto do produto.');
      const body = { nome: $('#v-nome').value, descricao: $('#v-descricao').value, custo_moedas: Number($('#v-custo').value), foto };
      await api(v ? `/vantagens/${v.id_vantagem}` : '/vantagens', { method: v ? 'PUT' : 'POST', body });
      toast(v ? 'Vantagem atualizada!' : 'Vantagem cadastrada!');
      fecharModal();
      aoSalvar();
    });
  });
}

// ================= Inicialização =================
mascaraCpf($('#ca-cpf'));
carregarInstituicoes();
if (sessao.token) iniciarApp();
