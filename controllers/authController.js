import jwt from 'jsonwebtoken';
import { readDatabase, writeDatabase } from '../utils/db.js';

export const register = (req, res) => {
  const { username, password } = req.body;
  const db = readDatabase();

  if (db.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Usuário já existe.' });
  }

  const newUser = {
    id: Date.now(),
    username,
    password,
    passwords: []
  };

  db.push(newUser);
  writeDatabase(db);

  res.status(201).json({ message: 'Usuário registrado com sucesso.' });
};

export const login = (req, res) => {
  const { username, password } = req.body;
  const db = readDatabase();
  const user = db.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};
