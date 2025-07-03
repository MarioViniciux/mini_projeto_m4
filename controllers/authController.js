import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { readDatabase, writeDatabase } from '../utils/db.js';

export const register = async (req, res) => {
  const { email, password } = req.body;
  const db = readDatabase();

  if (db.find(u => u.email === email)) {
    return res.status(400).json({ message: 'Usuário já existe.' });
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword,
    passwords: []
  };

  db.push(newUser);
  writeDatabase(db);

  res.status(201).json({ message: 'Usuário registrado com sucesso.' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const db = readDatabase();
  const user = db.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};

export default { register, login };