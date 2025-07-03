import { readDatabase, writeDatabase } from '../utils/db.js';
import { encrypt, decrypt } from '../utils/crypto.js';

export const getAllPasswords = (req, res) => {
  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);
  const passwords = user ? user.passwords : []

  const sanitizedPasswords = passwords.map(({ password, ...rest }) => rest)

  res.json(sanitizedPasswords);
};

export const getPassword = (req, res) => {
  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);
  const encryptedPass = user?.passwords.find(p => p.id === parseInt(req.params.id));

  if (!encryptedPass) return res.status(404).json({ message: 'Senha não encontrada.' });

  const decryptedPassword = decrypt(encryptedPass.password);
  res.json({ ...encryptedPass, password: decryptedPassword });
};

export const createPassword = (req, res) => {
  const { service, password } = req.body;
  const encryptedPassword = encrypt(password);

  const newPassword = {
    id: Date.now(),
    service,
    password: encryptedPassword,
  };

  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);
  
  user.passwords.push(newPassword);

  writeDatabase(db);
  
  res.status(201).json(newPassword);
};

export const updatePassword = (req, res) => {
  const { service, password } = req.body;
  const db = readDatabase();
  const user = db.find(u => u.id === req.user.id);
  const index = user?.passwords.findIndex(p => p.id === parseInt(req.params.id));

  if (index === -1) return res.status(404).json({ message: 'Senha não encontrada.' });

  if (service) user.passwords[index].service = service;

  if (password) {
    user.passwords[index].password = encrypt(password);
  }

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
