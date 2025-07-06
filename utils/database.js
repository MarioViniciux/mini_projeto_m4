// Importa o driver SQLite3 e a função open da biblioteca sqlite
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Define o caminho do banco de dados. Usa a variável de ambiente se existir,
// senão, usa o arquivo local.
const DATABASE_PATH = process.env.DATABASE_PATH || './database.db';

// Função para abrir uma conexão com o banco de dados SQLite
export async function openDb() {
  return open({
    filename: DATABASE_PATH, // Caminho do arquivo do banco de dados
    driver: sqlite3.Database   // Driver utilizado
  });
}

// Função para inicializar o banco de dados e criar as tabelas necessárias
export async function initializeDb() {
  const db = await openDb();

  // Habilita as chaves estrangeiras no SQLite
  await db.exec('PRAGMA foreign_keys = ON;');

  // Cria a tabela de usuários, se não existir
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  // Cria a tabela de senhas, se não existir
  await db.exec(`
    CREATE TABLE IF NOT EXISTS passwords (
      id INTEGER PRIMARY KEY,
      service TEXT,
      password TEXT,
      email TEXT,
      username TEXT,
      notes TEXT,
      user_id INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Cria a tabela de tags, se não existir
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE
    )
  `);

  // Cria a tabela de associação entre senhas e tags (muitos para muitos)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS password_tags (
      password_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (password_id, tag_id),
      FOREIGN KEY (password_id) REFERENCES passwords(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `);

  console.log('Banco de dados inicializado com sucesso.');
}

// Inicializa o banco de dados ao iniciar o projeto
initializeDb().catch(err => {
  console.error('Erro ao inicializar o banco de dados:', err);
});