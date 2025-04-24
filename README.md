
# 🔐 Password Manager API

Uma API simples de gerenciamento de senhas, desenvolvida em JavaScript usando o padrão MVC, com autenticação JWT e rotas protegidas.

---

## 🚀 Funcionalidades

- Registro e login de usuários
- Geração de token JWT
- Gerenciamento de senhas (CRUD)
- Proteção das rotas com autenticação via middleware

---

## 🧪 Como testar

1. Clone o projeto e instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env` na raiz do projeto com:
   ```
   JWT_SECRET=sua_chave_super_secreta
   ```

3. Inicie a API:
   ```bash
   node server.js
   ```

---

## 📄 Documentação das Rotas

### 🧍 Autenticação

#### POST `/api/auth/register`
- **Descrição:** Registra um novo usuário.
- **Entrada:**
  ```json
  {
    "username": "joao",
    "password": "123456"
  }
  ```
- **Resposta esperada:**
  ```json
  {
    "message": "Usuário registrado com sucesso."
  }
  ```

---

#### POST `/api/auth/login`
- **Descrição:** Faz login e retorna o token JWT.
- **Entrada:**
  ```json
  {
    "username": "joao",
    "password": "123456"
  }
  ```
- **Resposta esperada:**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```

---

### 🔐 Rotas protegidas (requer token JWT)

📌 **Header obrigatório:**
```
Authorization: Bearer <token>
```

---

#### GET `/api/passwords`
- **Descrição:** Lista todas as senhas salvas.
- **Resposta esperada:**
  ```json
  [
    {
      "id": 1713898420000,
      "service": "gmail",
      "password": "senhaDoGmail"
    }
  ]
  ```

---

#### GET `/api/passwords/:id`
- **Descrição:** Retorna uma senha específica pelo ID.
- **Resposta esperada:**
  ```json
  {
    "id": 1713898420000,
    "service": "gmail",
    "password": "senhaDoGmail"
  }
  ```

---

#### POST `/api/passwords`
- **Descrição:** Cadastra uma nova senha.
- **Entrada:**
  ```json
  {
    "service": "github",
    "password": "senhaDoGithub"
  }
  ```
- **Resposta esperada:**
  ```json
  {
    "id": 1713898450000,
    "service": "github",
    "password": "senhaDoGithub"
  }
  ```

---

#### PUT `/api/passwords/:id`
- **Descrição:** Atualiza uma senha.
- **Entrada:**
  ```json
  {
    "password": "novaSenha"
  }
  ```
- **Resposta esperada:**
  ```json
  {
    "id": 1713898450000,
    "service": "github",
    "password": "novaSenha"
  }
  ```

---

#### DELETE `/api/passwords/:id`
- **Descrição:** Remove uma senha.
- **Resposta esperada:**
  ```json
  {
    "message": "Senha removida."
  }
  ```

---

## 📦 Tecnologias utilizadas

- Node.js
- Express
- JWT
- Dotenv

---
