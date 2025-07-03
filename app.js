import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Habilita o CORS para permitir requisições de outros domínios
app.use(cors());
// Permite o uso de JSON no corpo das requisições
app.use(express.json());

// Rotas de autenticação (registro e login)
app.use('/api/auth', authRoutes);
// Rotas protegidas para gerenciamento de senhas
app.use('/api/passwords', passwordRoutes);

export default app;