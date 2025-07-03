import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export async function openDb() {
  return open({
    filename: './database.db', 
    driver: sqlite3.Database
  });
}

export async function initializeDb() {
  const db = await openDb();

  await db.exec('PRAGMA foreign_keys = ON;');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

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

  await db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      name TEXT UNIQUE
    )
  `);

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

initializeDb().catch(err => {
  console.error('Erro ao inicializar o banco de dados:', err);
});