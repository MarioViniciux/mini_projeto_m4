import express from 'express';
import {
  getAllPasswords,
  getPassword,
  createPassword,
  updatePassword,
  deletePassword
} from '../controllers/passwordController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Aplica o middleware de autenticação JWT em todas as rotas abaixo
router.use(authenticateToken);

// Rota para listar todas as senhas do usuário autenticado
router.get('/', getAllPasswords);
// Rota para obter uma senha específica do usuário autenticado
router.get('/:id', getPassword);
// Rota para criar uma nova senha
router.post('/', createPassword);
// Rota para atualizar uma senha existente
router.put('/:id', updatePassword);
// Rota para deletar uma senha
router.delete('/:id', deletePassword);

export default router;