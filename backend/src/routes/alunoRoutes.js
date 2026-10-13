const { Router } = require('express');
const AlunoController = require('../controllers/AlunoController');

const router = Router();

router.get('/', AlunoController.listar);
router.get('/:id', AlunoController.buscarPorId);
router.post('/', AlunoController.criar);
router.put('/:id', AlunoController.atualizar);
router.delete('/:id', AlunoController.deletar);

module.exports = router;
