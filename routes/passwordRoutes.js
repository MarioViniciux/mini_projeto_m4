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

router.use(authenticateToken);
router.get('/', getAllPasswords);
router.get('/:id', getPassword);
router.post('/', createPassword);
router.put('/:id', updatePassword);
router.delete('/:id', deletePassword);

export default router;
