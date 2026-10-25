const API_BASE = 'http://localhost:3001/api';

let abaAtual = 'alunos';
let instituicoesLista = [];

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  aplicarMascarasInput();
  await carregarStatusApi();
  await carregarInstituicoes();
  await carregarAlunos();
  await carregarEmpresas();
});

function aplicarMascarasInput() {
  const cpfInput = document.getElementById('aluno-cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.substring(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = v;
    });
  }

  const cnpjInput = document.getElementById('empresa-cnpj');
  if (cnpjInput) {
    cnpjInput.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      if (v.length > 14) v = v.substring(0, 14);
      v = v.replace(/^(\d{2})(\d)/, '$1.$2');
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
      v = v.replace(/(\d{4})(\d)/, '$1-$2');
      e.target.value = v;
    });
  }
}

// Checar status da API
async function carregarStatusApi() {
  const statusEl = document.getElementById('api-status-text');
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (res.ok) {
      statusEl.textContent = 'Backend Conectado (Sequelize)';
    } else {
      statusEl.textContent = 'Erro ao conectar à API';
    }
  } catch (err) {
    statusEl.textContent = 'Backend Offline';
  }
}

// Navegação entre abas
function navegarPara(aba) {
  abaAtual = aba;
  const isAlunos = aba === 'alunos';

  document.getElementById('nav-btn-alunos').classList.toggle('active', isAlunos);
  document.getElementById('nav-btn-empresas').classList.toggle('active', !isAlunos);

  document.getElementById('section-alunos').classList.toggle('active', isAlunos);
  document.getElementById('section-empresas').classList.toggle('active', !isAlunos);

  document.getElementById('view-title').textContent = isAlunos 
    ? 'Gerenciamento de Alunos' 
    : 'Gerenciamento de Empresas Parceiras';

  document.getElementById('view-subtitle').textContent = isAlunos
    ? 'Consulte, cadastre, edite e gerencie os alunos do sistema.'
    : 'Consulte, cadastre, edite e gerencie as empresas parceiras.';

  document.getElementById('btn-novo').innerHTML = isAlunos
    ? '<span class="btn-icon">+</span> Novo Aluno'
    : '<span class="btn-icon">+</span> Nova Empresa';
}

function abrirModalCadastro() {
  if (abaAtual === 'alunos') {
    abrirModalAluno();
  } else {
    abrirModalEmpresa();
  }
}

function showAlert(mensagem, tipo = 'success') {
  const container = document.getElementById('alert-container');
  container.innerHTML = `
    <div class="alert alert-${tipo}">
      <span>${mensagem}</span>
      <button style="background:none;border:none;cursor:pointer;font-weight:bold;" onclick="this.parentElement.remove()">&times;</button>
    </div>
  `;
  setTimeout(() => {
    if (container.firstElementChild) container.firstElementChild.remove();
  }, 4500);
}

// ==========================================
// INSTITUIÇÕES
// ==========================================
async function carregarInstituicoes() {
  try {
    const res = await fetch(`${API_BASE}/instituicoes`);
    if (res.ok) {
      instituicoesLista = await res.json();
      const select = document.getElementById('aluno-instituicao');
      select.innerHTML = '<option value="">Selecione uma instituição...</option>';
      instituicoesLista.forEach(inst => {
        select.innerHTML += `<option value="${inst.id_instituicao}">${inst.nome}</option>`;
      });
    }
  } catch (err) {
    console.error('Erro ao buscar instituições', err);
  }
}

let listaAlunosCache = [];
let listaEmpresasCache = [];

// ==========================================
// CRUD ALUNOS
// ==========================================
async function carregarAlunos() {
  const tbody = document.getElementById('tbody-alunos');
  try {
    const res = await fetch(`${API_BASE}/alunos`);
    if (!res.ok) throw new Error('Falha ao buscar alunos');
    listaAlunosCache = await res.json();
    renderizarAlunos(listaAlunosCache);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center loading-cell" style="color:var(--danger)">Erro ao carregar alunos do servidor.</td></tr>`;
  }
}

function renderizarAlunos(alunos) {
  const tbody = document.getElementById('tbody-alunos');
  document.getElementById('badge-total-alunos').textContent = `${alunos.length} registros`;

  if (alunos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center loading-cell">Nenhum aluno encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = alunos.map(a => `
    <tr>
      <td>#${a.id_aluno}</td>
      <td><strong>${escapeHtml(a.nome)}</strong></td>
      <td>${escapeHtml(a.email)}</td>
      <td>${escapeHtml(a.cpf)}</td>
      <td>${escapeHtml(a.curso)}</td>
      <td>${escapeHtml(a.instituicao ? a.instituicao.nome : '-')}</td>
      <td><span class="coins-badge"><img src="img/coin.png" class="coin-icon" alt="Moedas"> ${a.saldo_moedas}</span></td>
      <td class="text-right action-buttons">
        <button class="btn btn-sm btn-edit" onclick="editarAluno(${a.id_aluno})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="excluirAluno(${a.id_aluno})">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function filtrarAlunos() {
  const termo = (document.getElementById('search-alunos')?.value || '').toLowerCase().trim();
  if (!termo) {
    renderizarAlunos(listaAlunosCache);
    return;
  }
  const filtrados = listaAlunosCache.filter(a =>
    (a.nome && a.nome.toLowerCase().includes(termo)) ||
    (a.email && a.email.toLowerCase().includes(termo)) ||
    (a.cpf && a.cpf.toLowerCase().includes(termo)) ||
    (a.curso && a.curso.toLowerCase().includes(termo)) ||
    (a.instituicao && a.instituicao.nome && a.instituicao.nome.toLowerCase().includes(termo))
  );
  renderizarAlunos(filtrados);
}

function abrirModalAluno(dados = null) {
  const modal = document.getElementById('modal-aluno');
  const title = document.getElementById('modal-aluno-title');
  const btnSalvar = document.getElementById('btn-salvar-aluno');
  const senhaInput = document.getElementById('aluno-senha');
  const groupSaldo = document.getElementById('group-aluno-saldo');

  if (dados) {
    title.textContent = 'Editar Aluno';
    btnSalvar.textContent = 'Atualizar Aluno';
    document.getElementById('aluno-id').value = dados.id_aluno;
    document.getElementById('aluno-nome').value = dados.nome;
    document.getElementById('aluno-email').value = dados.email;
    document.getElementById('aluno-cpf').value = dados.cpf;
    document.getElementById('aluno-rg').value = dados.rg;
    document.getElementById('aluno-curso').value = dados.curso;
    document.getElementById('aluno-endereco').value = dados.endereco;
    document.getElementById('aluno-instituicao').value = dados.id_instituicao;
    document.getElementById('aluno-saldo').value = dados.saldo_moedas;

    groupSaldo.style.display = 'flex';
    senhaInput.removeAttribute('required');
    document.getElementById('aluno-senha-hint').style.display = 'block';
  } else {
    title.textContent = 'Cadastrar Novo Aluno';
    btnSalvar.textContent = 'Salvar Aluno';
    document.getElementById('form-aluno').reset();
    document.getElementById('aluno-id').value = '';
    groupSaldo.style.display = 'none';
    senhaInput.setAttribute('required', 'true');
    document.getElementById('aluno-senha-hint').style.display = 'none';
  }

  modal.classList.add('open');
}

function fecharModalAluno() {
  document.getElementById('modal-aluno').classList.remove('open');
}

async function editarAluno(id) {
  try {
    const res = await fetch(`${API_BASE}/alunos/${id}`);
    if (!res.ok) throw new Error('Não foi possível obter dados do aluno');
    const aluno = await res.json();
    abrirModalAluno(aluno);
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

async function salvarAluno(event) {
  event.preventDefault();
  const id = document.getElementById('aluno-id').value;

  const payload = {
    nome: document.getElementById('aluno-nome').value.trim(),
    email: document.getElementById('aluno-email').value.trim(),
    cpf: document.getElementById('aluno-cpf').value.trim(),
    rg: document.getElementById('aluno-rg').value.trim(),
    curso: document.getElementById('aluno-curso').value.trim(),
    endereco: document.getElementById('aluno-endereco').value.trim(),
    id_instituicao: parseInt(document.getElementById('aluno-instituicao').value, 10)
  };

  const senha = document.getElementById('aluno-senha').value;
  if (senha) {
    payload.senha = senha;
  }

  if (id) {
    payload.saldo_moedas = parseInt(document.getElementById('aluno-saldo').value, 10) || 0;
  }

  try {
    const url = id ? `${API_BASE}/alunos/${id}` : `${API_BASE}/alunos`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao processar requisição');
    }

    showAlert(id ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
    fecharModalAluno();
    await carregarAlunos();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

async function excluirAluno(id) {
  if (!confirm('Tem certeza que deseja excluir este aluno? Esta ação também removerá o usuário vinculado.')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/alunos/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao excluir aluno');

    showAlert('Aluno excluído com sucesso!');
    await carregarAlunos();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

// ==========================================
// CRUD EMPRESAS PARCEIRAS
// ==========================================
async function carregarEmpresas() {
  const tbody = document.getElementById('tbody-empresas');
  try {
    const res = await fetch(`${API_BASE}/empresas`);
    if (!res.ok) throw new Error('Falha ao buscar empresas');
    listaEmpresasCache = await res.json();
    renderizarEmpresas(listaEmpresasCache);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center loading-cell" style="color:var(--danger)">Erro ao carregar empresas parceiras.</td></tr>`;
  }
}

function renderizarEmpresas(empresas) {
  const tbody = document.getElementById('tbody-empresas');
  document.getElementById('badge-total-empresas').textContent = `${empresas.length} registros`;

  if (empresas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center loading-cell">Nenhuma empresa parceira encontrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = empresas.map(e => `
    <tr>
      <td>#${e.id_empresa}</td>
      <td><strong>${escapeHtml(e.nome)}</strong></td>
      <td>${escapeHtml(e.email)}</td>
      <td>${escapeHtml(e.cnpj || '-')}</td>
      <td>${escapeHtml(e.usuario ? e.usuario.login : '-')}</td>
      <td class="text-right action-buttons">
        <button class="btn btn-sm btn-edit" onclick="editarEmpresa(${e.id_empresa})">Editar</button>
        <button class="btn btn-sm btn-danger" onclick="excluirEmpresa(${e.id_empresa})">Excluir</button>
      </td>
    </tr>
  `).join('');
}

function filtrarEmpresas() {
  const termo = (document.getElementById('search-empresas')?.value || '').toLowerCase().trim();
  if (!termo) {
    renderizarEmpresas(listaEmpresasCache);
    return;
  }
  const filtradas = listaEmpresasCache.filter(e =>
    (e.nome && e.nome.toLowerCase().includes(termo)) ||
    (e.email && e.email.toLowerCase().includes(termo)) ||
    (e.cnpj && e.cnpj.toLowerCase().includes(termo)) ||
    (e.usuario && e.usuario.login && e.usuario.login.toLowerCase().includes(termo))
  );
  renderizarEmpresas(filtradas);
}

function abrirModalEmpresa(dados = null) {
  const modal = document.getElementById('modal-empresa');
  const title = document.getElementById('modal-empresa-title');
  const btnSalvar = document.getElementById('btn-salvar-empresa');
  const senhaInput = document.getElementById('empresa-senha');

  if (dados) {
    title.textContent = 'Editar Empresa Parceira';
    btnSalvar.textContent = 'Atualizar Empresa';
    document.getElementById('empresa-id').value = dados.id_empresa;
    document.getElementById('empresa-nome').value = dados.nome;
    document.getElementById('empresa-email').value = dados.email;
    document.getElementById('empresa-cnpj').value = dados.cnpj || '';

    senhaInput.removeAttribute('required');
    document.getElementById('empresa-senha-hint').style.display = 'block';
  } else {
    title.textContent = 'Cadastrar Empresa Parceira';
    btnSalvar.textContent = 'Salvar Empresa';
    document.getElementById('form-empresa').reset();
    document.getElementById('empresa-id').value = '';

    senhaInput.setAttribute('required', 'true');
    document.getElementById('empresa-senha-hint').style.display = 'none';
  }

  modal.classList.add('open');
}

function fecharModalEmpresa() {
  document.getElementById('modal-empresa').classList.remove('open');
}

async function editarEmpresa(id) {
  try {
    const res = await fetch(`${API_BASE}/empresas/${id}`);
    if (!res.ok) throw new Error('Não foi possível obter dados da empresa');
    const empresa = await res.json();
    abrirModalEmpresa(empresa);
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

async function salvarEmpresa(event) {
  event.preventDefault();
  const id = document.getElementById('empresa-id').value;

  const payload = {
    nome: document.getElementById('empresa-nome').value.trim(),
    email: document.getElementById('empresa-email').value.trim(),
    cnpj: document.getElementById('empresa-cnpj').value.trim() || null
  };

  const senha = document.getElementById('empresa-senha').value;
  if (senha) {
    payload.senha = senha;
  }

  try {
    const url = id ? `${API_BASE}/empresas/${id}` : `${API_BASE}/empresas`;
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao processar requisição');
    }

    showAlert(id ? 'Empresa parceira atualizada com sucesso!' : 'Empresa parceira cadastrada com sucesso!');
    fecharModalEmpresa();
    await carregarEmpresas();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

async function excluirEmpresa(id) {
  if (!confirm('Tem certeza que deseja excluir esta empresa parceira?')) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/empresas/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao excluir empresa');

    showAlert('Empresa parceira excluída com sucesso!');
    await carregarEmpresas();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
