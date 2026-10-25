const crypto = require('crypto');

const SECRET = process.env.AUTH_SECRET || 'moeda-estudantil-dev-secret';
const EXPIRACAO_MS = 8 * 60 * 60 * 1000; // 8 horas

function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(senha), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verificarSenha(senha, armazenada) {
  if (!armazenada) return false;
  if (!armazenada.startsWith('scrypt$')) return senha === armazenada; // legado (texto puro)
  const [, salt, hash] = armazenada.split('$');
  const calc = crypto.scryptSync(String(senha), salt, 64);
  return crypto.timingSafeEqual(calc, Buffer.from(hash, 'hex'));
}

// Token assinado com HMAC-SHA256 (formato semelhante ao JWT)
function gerarToken(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + EXPIRACAO_MS })).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function validarToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  const esperado = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  if (sig.length !== esperado.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp < Date.now()) return null;
  return payload;
}

module.exports = { hashSenha, verificarSenha, gerarToken, validarToken };
