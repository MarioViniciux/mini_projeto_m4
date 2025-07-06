import 'dotenv/config'; // Carrega variáveis de ambiente do arquivo .env
import pg from 'pg';

// Cria um pool de conexões com o banco de dados usando a URL de conexão do Neon
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL, // URL de conexão do banco de dados
})

// Função para inicializar o banco de dados e criar as tabelas necessárias
export async function initializeDb() {
  try {
    const client = await pool.connect(); // Tenta conectar ao banco de dados

    // Habilita a extensão para usar criptografia
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Cria a tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )`
    );

    // Cria a tabela de senhas
    await client.query(`
      CREATE TABLE IF NOT EXISTS passwords (
        id SERIAL PRIMARY KEY,
        service TEXT, 
        password TEXT,
        email TEXT,
        username TEXT,
        notes TEXT,
        user_id INTEGER NOT NULL,
        CONSTRAINT fk_user
          FOREIGN KEY(user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      )
    `);

    // Cria a tabela de tags
    await client.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      )
    `);

    // Cria a tabela de junção entre senhas e tags
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_tags (
        password_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (password_id, tag_id),
        CONSTRAINT fk_password
          FOREIGN KEY(password_id)
          REFERENCES passwords(id)
          ON DELETE CASCADE,
        CONSTRAINT fk_tag
          FOREIGN KEY(tag_id)
          REFERENCES tags(id)
          ON DELETE CASCADE
      )
    `);

    console.log("Banco de dados inciializado e tabelas verificadas.");
    client.release(); // Libera a conexão
  } catch (err) {
  console.error("Erro ao inicializar o banco de dados:", err);
  }
} 
