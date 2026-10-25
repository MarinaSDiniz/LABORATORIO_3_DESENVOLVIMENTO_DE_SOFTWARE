const { Router } = require('express');
const { autenticar, exigirPerfil } = require('../middlewares/auth');
const AuthController = require('../controllers/AuthController');
const ProfessorController = require('../controllers/ProfessorController');
const AlunoPortalController = require('../controllers/AlunoPortalController');
const VantagemController = require('../controllers/VantagemController');

const router = Router();

// US09 - Autenticação
router.post('/auth/login', AuthController.login);
router.get('/auth/me', autenticar, AuthController.me);
router.get('/notificacoes/me', autenticar, AlunoPortalController.notificacoes);

// Aluno (US02, US03, US04)
const aluno = [autenticar, exigirPerfil('ALUNO')];
router.get('/alunos/me', ...aluno, AlunoPortalController.meusDados);
router.get('/alunos/me/extrato', ...aluno, AlunoPortalController.extrato);
router.post('/alunos/me/resgates', ...aluno, AlunoPortalController.resgatar);

// Professor (US05, US06)
const prof = [autenticar, exigirPerfil('PROFESSOR')];
router.get('/professores/me', ...prof, ProfessorController.meusDados);
router.get('/professores/me/extrato', ...prof, ProfessorController.extrato);
router.get('/professores/me/alunos', ...prof, ProfessorController.alunos);
router.post('/professores/me/envios', ...prof, ProfessorController.enviarMoedas);

// Vantagens / Empresa (US07, US08)
const empresa = [autenticar, exigirPerfil('EMPRESA')];
router.get('/vantagens', autenticar, VantagemController.listar);
router.post('/vantagens', ...empresa, VantagemController.criar);
router.put('/vantagens/:id', ...empresa, VantagemController.atualizar);
router.delete('/vantagens/:id', ...empresa, VantagemController.remover);
router.get('/empresas/me/vantagens', ...empresa, VantagemController.minhas);
router.get('/empresas/me/resgates', ...empresa, VantagemController.resgates);
router.post('/empresas/me/validar-cupom', ...empresa, VantagemController.validarCupom);

module.exports = router;
