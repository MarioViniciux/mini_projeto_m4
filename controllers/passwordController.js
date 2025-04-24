import { readDatabase, writeDatabase } from '../utils/db.js';

export const getAllPasswords = (req, res) => {
  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);
  res.json(user ? user.passwords : []);
};

export const getPassword = (req, res) => {
  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);
  const pass = user?.passwords.find(p => p.id === parseInt(req.params.id));
  if (!pass) return res.status(404).json({ message: 'Senha não encontrada.' });
  res.json(pass);
};

export const createPassword = (req, res) => {
  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);

  const newPass = { id: Date.now(), ...req.body };
  user.passwords.push(newPass);

  writeDatabase(db);
  res.status(201).json(newPass);
};

export const updatePassword = (req, res) => {
  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);
  const index = user.passwords.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Senha não encontrada.' });

  user.passwords[index] = { ...user.passwords[index], ...req.body };
  writeDatabase(db);
  res.json(user.passwords[index]);
};

export const deletePassword = (req, res) => {
  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);
  user.passwords = user.passwords.filter(p => p.id !== parseInt(req.params.id));
  writeDatabase(db);
  res.json({ message: 'Senha removida.' });
};
