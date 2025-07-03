import 'dotenv/config';
import jwt from 'jsonwebtoken';

// Middleware para autenticar o token JWT nas rotas protegidas
export const authenticateToken = (req, res, next) => {
  // Recupera o header Authorization (formato: Bearer <token>)
  const authHeader = req.headers['authorization'];
  // Extrai o token do header
  const token = authHeader && authHeader.split(' ')[1];
  // Se não houver token, retorna 401 (não autorizado)
  if (!token) return res.sendStatus(401);

  // Verifica o token usando a chave secreta
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    // Se o token for inválido ou expirado, retorna 403 (proibido)
    if (err) return res.sendStatus(403);
    // Adiciona os dados do usuário ao objeto req para uso posterior
    req.user = user;
    // Chama o próximo middleware ou rota
    next();
  });
};