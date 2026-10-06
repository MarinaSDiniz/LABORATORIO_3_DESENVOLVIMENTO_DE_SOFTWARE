# Sistema de Moeda Estudantil

Este repositório contém o projeto do **Sistema de Moeda Estudantil**, desenvolvido para o Laboratório 3 de Projeto de Software. O objetivo do sistema é estimular o reconhecimento do mérito estudantil através de uma moeda virtual, distribuída por professores e trocada por alunos em empresas parceiras.

---

## 🏗️ Modelagem do Sistema (Artefatos)

Abaixo estão as referências para os diagramas arquiteturais e estruturais do projeto. *(Certifique-se de que as imagens correspondentes estejam salvas na pasta `artefatos` do seu repositório).*

### Diagrama de Casos de Uso
Ilustra as interações dos atores (Aluno, Professor e Empresa Parceira) com as funcionalidades do sistema.
![Diagrama de Casos de Uso](artefatos/Diagrama de Casos de Uso - Sistema de Moeda Estudantil.png)

### Diagrama de Classes
Apresenta a estrutura de entidades, atributos, métodos e os relacionamentos de negócio.
![Diagrama de Classes](artefatos/Diagrama de Classes - Sistema de Moeda Estudantil.png)

### Diagrama de Componentes
Demonstra a arquitetura baseada no padrão MVC e na estratégia de persistência (DAO/ORM).
![Diagrama de Componentes](artefatos/Diagrama de Componentes - Sistema de Moeda Estudantil.png)

---

## 📝 Histórias de Usuário (User Stories)

As histórias de usuário foram extraídas com base nos requisitos do sistema e separadas pelo tipo de ator.

### 🎓 Aluno
* **US01 - Cadastro no Sistema:** Como um *aluno*, eu quero *me cadastrar no sistema informando nome, email, CPF, RG, Endereço, Instituição de Ensino e curso*, para que *eu possa criar minha conta e ingressar no sistema de mérito.*
* **US02 - Consulta de Extrato:** Como um *aluno*, eu quero *consultar o extrato da minha conta*, para que *eu possa visualizar o total de moedas que possuo e o histórico de recebimentos e trocas.*
* **US03 - Troca por Vantagens:** Como um *aluno*, eu quero *selecionar e trocar minhas moedas por vantagens cadastradas*, para que *eu obtenha descontos, mensalidades ou materiais em empresas parceiras.*
* **US04 - Recebimento de Notificação:** Como um *aluno*, eu quero *receber uma notificação por e-mail contendo o código do cupom ao realizar uma troca*, para que *eu possa utilizar esse código presencialmente na empresa parceira.*

### 👨‍🏫 Professor
* **US05 - Envio de Moedas:** Como um *professor*, eu quero *enviar moedas para um aluno, indicando o valor e escrevendo um motivo obrigatório*, para que *eu possa reconhecer seu mérito estudantil (bom comportamento, participação, etc).*
* **US06 - Consulta de Saldo e Histórico:** Como um *professor*, eu quero *consultar o extrato da minha conta*, para que *eu saiba quantas moedas ainda tenho disponíveis para distribuir no semestre e veja para quem já enviei.*

### 🏢 Empresa Parceira
* **US07 - Cadastro de Vantagens:** Como uma *empresa parceira*, eu quero *cadastrar uma vantagem incluindo descrição, foto do produto e custo em moedas*, para que *os alunos possam visualizar e resgatar essas ofertas.*
* **US08 - Conferência de Troca (Notificação):** Como uma *empresa parceira*, eu quero *receber um e-mail com um código gerado pelo sistema sempre que um aluno resgatar uma vantagem minha*, para que *eu possa conferir e validar a troca de forma segura presencialmente.*

### 🔐 Segurança e Acesso Geral (Todos os Usuários)
* **US09 - Autenticação no Sistema:** Como um *usuário (aluno, professor ou parceiro)*, eu quero *fazer login utilizando uma senha cadastrada*, para que *eu possa acessar o sistema e realizar minhas ações de forma segura e autenticada.*

---

**Tecnologias Utilizadas:** *(A preencher com as tecnologias do tutorial da Sprint 03)*
**Arquitetura:** MVC (Model-View-Controller)
