import app from './app.js';
import { initializeDb } from './utils/database.js';

const PORT = process.env.PORT || 3000;

initializeDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Falha ao inicializar o banco de dados:", err);
  process.exit(1);
});