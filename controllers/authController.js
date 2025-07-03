import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { openDb } from '../utils/database.js';

export const register = async (req, res) => {
  const { email, password } = req.body;
  const db = await openDb();

  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (existingUser) {
    return res.status(400).json({ message: 'Usuário já existe.' });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const result = await db.run(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    email,
    hashedPassword
  );

  res.status(201).json({ message: 'Usuário registrado com sucesso.', userId: result.lastID });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const db = await openDb();
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};

export default { register, login };