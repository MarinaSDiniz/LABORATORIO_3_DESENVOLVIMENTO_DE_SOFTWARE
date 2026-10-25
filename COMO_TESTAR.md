# 🧪 Como Executar e Testar o Sistema de Moeda Estudantil

## 1. Pré-requisitos
- [Node.js](https://nodejs.org/) 18 ou superior
- npm (instalado junto com o Node)

## 2. Executando o projeto

```powershell
cd backend
npm install
npm start
```

Saída esperada:
```
✅ Banco de dados SQLite sincronizado com sucesso via Sequelize ORM.
🌱 Instituições de ensino de exemplo inseridas com sucesso.
🌱 Professores de exemplo inseridos (login = e-mail, senha 123456).
🚀 Servidor rodando em http://localhost:3001
```

O backend também serve o frontend, então basta abrir no navegador:

| Página | URL |
|---|---|
| Portal (login/cadastro) | http://localhost:3001 |
| Painel administrativo (CRUD de alunos e empresas) | http://localhost:3001/admin.html |
| Health check da API | http://localhost:3001/api/status |

> ⚠️ **Erro `SQLITE_CONSTRAINT` ao iniciar?** O banco local ficou inconsistente após mudanças nos modelos. Apague-o e inicie de novo:
> ```powershell
> Remove-Item src\database.sqlite
> npm start
> ```

## 3. Usuários de teste

Os professores são pré-cadastrados pela instituição (não há cadastro de professor pela interface).
**Login = e-mail · Senha = `123456`**

| Professor | E-mail (login) | Senha | Departamento | Instituição |
|---|---|---|---|---|
| Ana Souza | `ana.souza@prof.com` | `123456` | Engenharia de Software | PUC Minas - Coração Eucarístico |
| Carlos Lima | `carlos.lima@prof.com` | `123456` | Ciência da Computação | PUC Minas - Coração Eucarístico |
| Beatriz Rocha | `beatriz.rocha@prof.com` | `123456` | Sistemas de Informação | UFMG |

Cada professor recebe automaticamente **1.000 moedas por semestre** (acumuláveis).

Alunos e empresas parceiras são criados pelas abas **"Sou aluno"** e **"Sou empresa"** na tela inicial.

## 4. Roteiro de teste (fluxo completo)

1. **Cadastrar um aluno (US01)** — aba *Sou aluno*: preencha nome, e-mail, CPF, RG, endereço, instituição (ex.: PUC Minas - Coração Eucarístico), curso e senha.
2. **Cadastrar uma empresa (US07)** — aba *Sou empresa*: preencha nome, e-mail e senha.
3. **Cadastrar vantagem (US07)** — logado como empresa, cadastre uma vantagem com descrição, foto e custo (ex.: 100 moedas).
4. **Login como professor (US09)** — `ana.souza@prof.com` / `123456`. Verifique o saldo de 1.000 moedas (US06).
5. **Enviar moedas (US05)** — escolha o aluno criado, informe o valor (ex.: 300) e um motivo (obrigatório). Confira o extrato do professor.
6. **Extrato do aluno (US02)** — saia e entre como o aluno. O saldo deve ser 300 e o recebimento deve aparecer no histórico.
7. **Trocar por vantagem (US03)** — resgate a vantagem da empresa. O saldo é debitado e um código de cupom é gerado.
8. **Notificações (US04 / US08)** — verifique o e-mail/notificação com o cupom no portal do aluno e o e-mail de conferência no portal da empresa.

### Casos de erro esperados
- Professor enviando mais moedas que o saldo → *"Saldo insuficiente"*.
- Envio sem motivo → bloqueado.
- Aluno resgatando vantagem mais cara que o saldo → *"Saldo insuficiente"*.
- Login com senha incorreta → mensagem de erro.

## 5. Envio real de e-mails (opcional)
Por padrão as notificações ficam registradas no sistema. Para envio real via SMTP, defina as variáveis de ambiente usadas em [`EmailService.js`](backend/src/services/EmailService.js) (ex.: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`) antes de `npm start`.
