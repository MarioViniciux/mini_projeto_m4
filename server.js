// Importa o app Express configurado e a função para inicializar o banco de dados
import app from './app.js';
import { initializeDb } from './utils/database.js';

// Define a porta do servidor (usa a variável de ambiente ou 3000 por padrão)
const PORT = process.env.PORT || 3000;

// Inicializa o banco de dados e, se bem-sucedido, inicia o servidor
initializeDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  // Em caso de erro ao inicializar o banco, exibe o erro e encerra o processo
  console.error("Falha ao inicializar o banco de dados:", err);
  process.exit(1);
});