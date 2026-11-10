# Implantação em nuvem — Sistema de Moeda Estudantil

## Arquitetura proposta

- **Vercel:** frontend estático (`frontend/`).
- **Render:** backend Node.js/Express (`backend/`), publicado como Web Service.
- **Render PostgreSQL:** banco de dados persistente.
- **SMTP externo:** envio de notificações por e-mail, quando configurado.

O diagrama PlantUML correspondente está em `Artefatos/Diagrama de Implantacao - Sistema de Moeda Estudantil.puml`.

## Estado atual do repositório e adaptações obrigatórias

A análise do código indica que o projeto ainda não está pronto para publicação direta nessa arquitetura:

1. O backend usa Sequelize com **SQLite em arquivo local** (`backend/src/config/database.js`). Para produção no Render, recomenda-se migrar para PostgreSQL (`pg` e `pg-hstore`) e configurar a conexão por `DATABASE_URL`.
2. `frontend/js/app.js` define `API_BASE` como `http://localhost:3001/api`.
3. `frontend/js/portal.js` também usa `localhost:3001` quando o frontend não está na porta 3001.
4. O backend habilita CORS sem restrição de origem. Em produção, deve permitir somente o domínio publicado na Vercel.
5. As credenciais SMTP devem ser cadastradas como variáveis de ambiente no Render, nunca versionadas no Git.
6. O projeto deve ser testado com dados persistidos e fluxos de autenticação depois da migração.

Portanto, o diagrama representa a **arquitetura-alvo de produção**, não uma implantação já realizada.

## Passos de publicação

### 1. Preparar o banco de dados no Render

1. Criar uma instância PostgreSQL no Render.
2. Copiar a Internal Database URL para uso pelo serviço backend.
3. Adaptar `backend/src/config/database.js` para usar PostgreSQL e `process.env.DATABASE_URL`.
4. Configurar SSL conforme as instruções atuais do Render e do driver PostgreSQL.
5. Planejar migração/seed de dados. Não depender de `sequelize.sync({ alter: true })` como estratégia definitiva de evolução do schema em produção.

### 2. Publicar o backend no Render

- Criar um **Web Service** conectado ao repositório Git.
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Configurar `DATABASE_URL` e demais segredos necessários.
- Adicionar endpoint de health check: `/api/status`.
- Configurar CORS para aceitar somente o domínio Vercel.
- Após a publicação, validar `https://<servico>.onrender.com/api/status`.

Variáveis SMTP, caso o envio de e-mail seja utilizado:
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

### 3. Publicar o frontend na Vercel

- Criar um projeto Vercel conectado ao mesmo repositório.
- Framework Preset: Other.
- Root Directory: `frontend`.
- Build Command: deixar vazio, pois o frontend atual é HTML/CSS/JavaScript estático.
- Output Directory: `.`.
- Definir uma variável pública, por exemplo `API_BASE_URL`, com `https://<servico>.onrender.com/api`.
- Ajustar `app.js` e `portal.js` para consumir essa configuração, removendo referências fixas a `localhost`.
- Fazer redeploy após configurar a variável.

### 4. Validar a implantação

- Abrir o domínio Vercel via HTTPS.
- Testar cadastro/login e autenticação por token.
- Testar operações de alunos, professores, empresas, vantagens e transações.
- Confirmar que os dados continuam disponíveis após reiniciar/reimplantar o backend.
- Testar envio de e-mail, se habilitado.
- Verificar logs do Render e erros de CORS no navegador.

## Observação

A publicação efetiva depende de acesso às contas Vercel/Render, configuração do repositório e credenciais de banco/SMTP. Este documento e o diagrama descrevem a arquitetura e o procedimento; não afirmam que o sistema já esteja publicado.
