const { Router } = require('express');
const EmpresaParceiraController = require('../controllers/EmpresaParceiraController');

const router = Router();

router.get('/', EmpresaParceiraController.listar);
router.get('/:id', EmpresaParceiraController.buscarPorId);
router.post('/', EmpresaParceiraController.criar);
router.put('/:id', EmpresaParceiraController.atualizar);
router.delete('/:id', EmpresaParceiraController.deletar);

module.exports = router;
