const { validarToken } = require('../services/AuthService');

function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = validarToken(token);
  if (!payload) return res.status(401).json({ error: 'Não autenticado. Faça login novamente.' });
  req.auth = payload; // { id_usuario, perfil, id_entidade }
  next();
}

function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!req.auth || !perfis.includes(req.auth.perfil)) {
      return res.status(403).json({ error: 'Acesso negado para este perfil.' });
    }
    next();
  };
}

module.exports = { autenticar, exigirPerfil };
