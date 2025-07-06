// Carrega as variáveis de ambiente do arquivo .env
import 'dotenv/config';
// Importa a biblioteca para geração e verificação de tokens JWT
import jwt from 'jsonwebtoken';
// Importa a biblioteca para hash de senhas
import bcrypt from 'bcrypt';
// Função para abrir conexão com o banco de dados 
import { pool } from '../utils/database.js';

// Função para registrar um novo usuário
export const register = async (req, res) => {
  // Extrai email e senha do corpo da requisição
  const { email, password } = req.body;

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário já existe.'});
    }

    const saltRounds = 10; // Define o número de rounds para o hash da senha
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Gera o hash da senha usada

    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', [email, hashedPassword]
    );

    res.status(201).json({ message: 'Usuário registrado com sucesso.', userId: result.rows[0].id })
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Função para login do usuário
export const login = async (req, res) => {
  // Extrai email e senha do corpo da requisição
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciais inválidas.'});
    }

    const token = jwt.sign({ id: user.id, email: user.email}, process.env.JWT_SECRET, {expiresIn: '1d'});
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
};