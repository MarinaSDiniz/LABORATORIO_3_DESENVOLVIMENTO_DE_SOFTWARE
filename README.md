# Sistema de Moeda Estudantil

Este repositório contém o projeto do **Sistema de Moeda Estudantil**, desenvolvido para o Laboratório 3 de Projeto de Software. O objetivo do sistema é estimular o reconhecimento do mérito estudantil através de uma moeda virtual, distribuída por professores e trocada por alunos em empresas parceiras.

## Aparência

![Tela inicial](<Artefatos/log.png>)

## 🚀 Início Rápido

```powershell
cd backend
npm install
npm start
```

Acesse **http://localhost:3001**. Professor de teste: `ana.souza@prof.com` / `123456`.

📄 Guia completo de execução, usuários de teste e roteiro de testes: **[COMO_TESTAR.md](COMO_TESTAR.md)**

---

## 🏗️ Modelagem do Sistema (Artefatos)

Abaixo estão as referências para os diagramas arquiteturais e estruturais do projeto.

### Diagrama de Casos de Uso

Ilustra as interações dos atores (Aluno, Professor e Empresa Parceira) com as funcionalidades do sistema.

![Diagrama de Casos de Uso](<Artefatos/Diagrama de Casos de Uso - Sistema de Moeda Estudantil.png>)

### Diagrama de Classes

Apresenta a estrutura de entidades, atributos, métodos e os relacionamentos de negócio.

![Diagrama de Classes](<Artefatos/Diagrama de Classes - Sistema de Moeda Estudantil.png>)

### Diagrama de Componentes

Demonstra a arquitetura baseada no padrão MVC e na estratégia de acesso a dados DAO.

![Diagrama de Componentes](<Artefatos/Diagrama de Componentes - Sistema de Moeda Estudantil.png>)

### Diagrama DER

Demonstra as entidades, atributos e relacionamentos do banco de dados.

![Diagrama DER](<Artefatos/Diagrama DER - Sistema de Moeda Estudantil.svg>)

---

## 🏛️ Arquitetura e Padrões de Projeto

O Sistema de Moeda Estudantil utiliza a arquitetura **MVC (Model-View-Controller)**, complementada pelo padrão de projeto **DAO (Data Access Object)**. Essa organização permite separar as responsabilidades da aplicação, facilitando a manutenção, a organização e a evolução do sistema.

### MVC (Model-View-Controller)

O padrão MVC organiza a aplicação em três componentes principais:

- **Model (Modelo):** representa as entidades e os dados do sistema, como alunos, usuários e empresas parceiras.
- **View (Visão):** corresponde à interface com a qual os usuários interagem, permitindo visualizar informações e acessar as funcionalidades do sistema.
- **Controller (Controlador):** recebe e processa as requisições, coordenando as operações necessárias para atender às solicitações dos usuários.

No projeto, essa separação pode ser observada na organização das pastas `models`, `controllers` e `frontend`.

### DAO (Data Access Object)

O padrão DAO é utilizado para separar as operações de acesso e persistência dos dados da lógica de controle da aplicação. Ele centraliza operações como consultas, inserções, atualizações e exclusões no banco de dados.

No projeto, esse padrão está representado pela pasta `backend/src/dao`, que contém arquivos como `AlunoDAO.js` e `EmpresaParceiraDAO.js`.

### Organização dos Componentes

A estrutura do projeto está organizada da seguinte forma:

| Diretório ou arquivo | Responsabilidade |
|---|---|
| `backend/src/models/` | Representação das entidades e dos dados do sistema. |
| `backend/src/controllers/` | Processamento das requisições e coordenação das operações. |
| `backend/src/dao/` | Acesso e persistência dos dados no banco de dados. |
| `backend/src/routes/` | Definição das rotas e direcionamento das requisições aos controladores. |
| `backend/src/config/` | Configurações da aplicação, incluindo a conexão com o banco de dados. |
| `backend/database.sqlite` | Banco de dados SQLite utilizado para armazenar as informações. |
| `frontend/` | Arquivos responsáveis pela interface do usuário, incluindo HTML, CSS e JavaScript. |

### Fluxo Geral da Aplicação

De maneira simplificada, o funcionamento segue o fluxo abaixo:

1. O usuário interage com a interface do sistema (**View**).
2. A requisição é encaminhada por uma rota (**Routes**).
3. O controlador (**Controller**) coordena o processamento da solicitação.
4. Quando necessário, o controlador utiliza o DAO para consultar ou modificar os dados.
5. O DAO realiza as operações de persistência no banco de dados (**SQLite**).
6. O resultado é retornado para ser apresentado ao usuário pela interface.

Essa organização promove a separação de responsabilidades e reduz o acoplamento entre as partes do sistema.

---

## 📝 Histórias de Usuário (User Stories)

As histórias de usuário foram extraídas com base nos requisitos do sistema e separadas pelo tipo de ator.

### 🎓 Aluno

- **US01 - Cadastro no Sistema:** Como um *aluno*, eu quero *me cadastrar no sistema informando nome, email, CPF, RG, endereço, instituição de ensino e curso*, para que *eu possa criar minha conta e ingressar no sistema de mérito*.
- **US02 - Consulta de Extrato:** Como um *aluno*, eu quero *consultar o extrato da minha conta*, para que *eu possa visualizar o total de moedas que possuo e o histórico de recebimentos e trocas*.
- **US03 - Troca por Vantagens:** Como um *aluno*, eu quero *selecionar e trocar minhas moedas por vantagens cadastradas*, para que *eu obtenha descontos, mensalidades ou materiais em empresas parceiras*.
- **US04 - Recebimento de Notificação:** Como um *aluno*, eu quero *receber uma notificação por e-mail contendo o código do cupom ao realizar uma troca*, para que *eu possa utilizar esse código presencialmente na empresa parceira*.

### 👨‍🏫 Professor

- **US05 - Envio de Moedas:** Como um *professor*, eu quero *enviar moedas para um aluno, indicando o valor e escrevendo um motivo obrigatório*, para que *eu possa reconhecer seu mérito estudantil (bom comportamento, participação etc.)*.
- **US06 - Consulta de Saldo e Histórico:** Como um *professor*, eu quero *consultar o extrato da minha conta*, para que *eu saiba quantas moedas ainda tenho disponíveis para distribuir no semestre e veja para quem já enviei*.

### 🏢 Empresa Parceira

- **US07 - Cadastro de Vantagens:** Como uma *empresa parceira*, eu quero *cadastrar uma vantagem incluindo descrição, foto do produto e custo em moedas*, para que *os alunos possam visualizar e resgatar essas ofertas*.
- **US08 - Conferência de Troca (Notificação):** Como uma *empresa parceira*, eu quero *receber um e-mail com um código gerado pelo sistema sempre que um aluno resgatar uma vantagem minha*, para que *eu possa conferir e validar a troca de forma segura presencialmente*.

### 🔐 Segurança e Acesso Geral (Todos os Usuários)

- **US09 - Autenticação no Sistema:** Como um *usuário (aluno, professor ou parceiro)*, eu quero *fazer login utilizando uma senha cadastrada*, para que *eu possa acessar o sistema e realizar minhas ações de forma segura e autenticada*.

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js.
- **Banco de dados:** SQLite.
- **Frontend:** HTML, CSS e JavaScript.

**Arquitetura:** MVC (Model-View-Controller).

**Padrão de acesso a dados:** DAO (Data Access Object).
