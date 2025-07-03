// Carrega as variáveis de ambiente do arquivo .env
import 'dotenv/config';
// Importa a biblioteca para geração e verificação de tokens JWT
import jwt from 'jsonwebtoken';
// Importa a biblioteca para hash de senhas
import bcrypt from 'bcrypt';
// Função para abrir conexão com o banco de dados SQLite
import { openDb } from '../utils/database.js';

// Função para registrar um novo usuário
export const register = async (req, res) => {
  // Extrai email e senha do corpo da requisição
  const { email, password } = req.body;
  // Abre conexão com o banco de dados
  const db = await openDb();

  // Verifica se já existe um usuário com o mesmo email
  const existingUser = await db.get('SELECT * FROM users WHERE email = ?', email);
  if (existingUser) {
    // Retorna erro se o usuário já existe
    return res.status(400).json({ message: 'Usuário já existe.' });
  }

  // Define o número de rounds para o salt do bcrypt
  const saltRounds = 10;
  // Gera o hash da senha
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Insere o novo usuário no banco de dados
  const result = await db.run(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    email,
    hashedPassword
  );

  // Retorna sucesso e o ID do novo usuário
  res.status(201).json({ message: 'Usuário registrado com sucesso.', userId: result.lastID });
};

// Função para login do usuário
export const login = async (req, res) => {
  // Extrai email e senha do corpo da requisição
  const { email, password } = req.body;
  // Abre conexão com o banco de dados
  const db = await openDb();
  // Busca o usuário pelo email
  const user = await db.get('SELECT * FROM users WHERE email = ?', email);

  // Verifica se o usuário existe e se a senha está correta
  if (!user || !(await bcrypt.compare(password, user.password))) {
    // Retorna erro se as credenciais forem inválidas
    return res.status(401).json({ message: 'Credenciais inválidas.' });
  }

  // Gera um token JWT com o id e email do usuário, válido por 1 dia
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  // Retorna o token para o cliente
  res.json({ token });
};

// Exporta as funções register e login como padrão
export default { register, login };