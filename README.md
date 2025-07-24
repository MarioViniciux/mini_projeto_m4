# 🔐 API Gerenciadora de Senhas com Tags

Uma API RESTful segura para gerenciamento de senhas, desenvolvida em Node.js e Express. Utiliza autenticação baseada em JSON Web Token (JWT), armazena dados em um banco de dados Postgresql e suporta um sistema flexível de tags para organização.

## ✨ Funcionalidades

-   **Autenticação Segura**: Registro e login de usuários com senhas criptografadas (bcrypt) e geração de tokens JWT.
-   **Gerenciamento de Senhas (CRUD)**: Operações completas para criar, ler, atualizar e deletar senhas.
-   **Atualizações Parciais (PATCH/PUT)**: O endpoint de atualização modifica apenas os campos enviados, preservando os dados existentes.
-   **Sistema de Tags**: Associe múltiplas tags a cada senha para facilitar a organização e a busca (relação muitos-para-muitos).
-   **Banco de Dados Postgresql**: Persistência de dados robusta e local, ideal para desenvolvimento e pequenas aplicações.
-   **Rotas Protegidas**: Middleware para garantir que apenas usuários autenticados possam acessar os endpoints de senhas.

## 🛠️ Tecnologias Utilizadas

-   **Backend**: Node.js, Express.js
-   **Banco de Dados**: Postgresql
-   **Autenticação**: JSON Web Token (JWT), bcrypt
-   **Variáveis de Ambiente**: `dotenv`
-   **Outros**: `cors`

## 🚀 Como Executar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-seu-repositorio>
    cd <nome-da-pasta>
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Crie e configure o arquivo `.env`** na raiz do projeto. Ele deve conter as chaves secretas para JWT e para a criptografia das senhas:
    ```env
    # Chave para gerar os tokens JWT (pode ser qualquer string segura)
    JWT_SECRET=sua_chave_super_secreta_aqui

    # Chave para criptografar as senhas no banco (DEVE ter 64 caracteres hexadecimais)
    ENCRYPTION_KEY=crieaquisuaencryptionkeyde64caractereshexadecimais1234567890
    ```
    > **Importante**: A `ENCRYPTION_KEY` precisa ter exatamente 64 caracteres hexadecimais (0-9, a-f) para compor uma chave de 32 bytes.

4.  **Inicie a API:**
    ```bash
    node server.js
    ```
    O servidor será iniciado, e o arquivo de banco de dados (`database.db`) será criado automaticamente na primeira execução.

---

## 📄 Documentação da API

### 🧍 Autenticação

#### `POST /api/auth/register`

-   **Descrição:** Registra um novo usuário no sistema.
-   **Corpo da Requisição:**
    ```json
    {
      "email": "usuario@exemplo.com",
      "password": "senha_forte_123"
    }
    ```
-   **Resposta de Sucesso (201 Created):**
    ```json
    {
      "message": "Usuário registrado com sucesso."
    }
    ```

#### `POST /api/auth/login`

-   **Descrição:** Autentica um usuário e retorna um token JWT.
-   **Corpo da Requisição:**
    ```json
    {
      "email": "usuario@exemplo.com",
      "password": "senha_forte_123"
    }
    ```
-   **Resposta de Sucesso (200 OK):**
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

---

### 🔐 Gerenciamento de Senhas (Rotas Protegidas)

📌 **Header Obrigatório** para todas as rotas abaixo:
`Authorization: Bearer <seu-token-jwt>`

#### `GET /api/passwords`

-   **Descrição:** Lista todas as senhas salvas pelo usuário autenticado, incluindo suas tags.
-   **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "id": 1,
        "service": "GitHub",
        "email": "dev@exemplo.com",
        "username": "dev_user",
        "notes": "Conta principal de desenvolvimento.",
        "tags": [
          { "id": 1, "name": "Trabalho" },
          { "id": 2, "name": "Código" }
        ]
      }
    ]
    ```

#### `GET /api/passwords/:id`

-   **Descrição:** Retorna uma senha específica pelo seu ID, com a senha descriptografada.
-   **Resposta de Sucesso (200 OK):**
    ```json
    {
      "id": 1,
      "service": "GitHub",
      "password": "minha_senha_secreta_do_github",
      "email": "dev@exemplo.com",
      "username": "dev_user",
      "notes": "Conta principal de desenvolvimento.",
      "tags": [
        { "id": 1, "name": "Trabalho" }
      ]
    }
    ```

#### `POST /api/passwords`

-   **Descrição:** Cadastra uma nova senha e a associa a tags. Tags novas são criadas automaticamente.
-   **Corpo da Requisição:**
    ```json
    {
      "service": "Netflix",
      "password": "senha_do_streaming_123",
      "email": "usuario@exemplo.com",
      "username": "user_netflix",
      "notes": "Conta compartilhada.",
      "tags": ["Entretenimento", "Pessoal"]
    }
    ```
-   **Resposta de Sucesso (201 Created):**
    ```json
    {
      "id": 2,
      "service": "Netflix",
      "email": "usuario@exemplo.com",
      "username": "user_netflix",
      "notes": "Conta compartilhada.",
      "tags": [
        { "id": 3, "name": "Entretenimento" },
        { "id": 4, "name": "Pessoal" }
      ]
    }
    ```

#### `PUT /api/passwords/:id`

-   **Descrição:** Atualiza uma senha existente. Suporta **atualizações parciais**: envie apenas os campos que deseja alterar.
-   **Exemplo (atualizando apenas as notas e tags):**
    ```json
    {
      "notes": "Nova nota sobre a conta.",
      "tags": ["Entretenimento", "Streaming"]
    }
    ```
-   **Resposta de Sucesso (200 OK):**
    ```json
    {
      "id": 2,
      "service": "Netflix",
      "email": "usuario@exemplo.com",
      "username": "user_netflix",
      "notes": "Nova nota sobre a conta.",
      "tags": [
        { "id": 3, "name": "Entretenimento" },
        { "id": 5, "name": "Streaming" }
      ]
    }
    ```

#### `DELETE /api/passwords/:id`

-   **Descrição:** Remove uma senha do banco de dados.
-   **Resposta de Sucesso (200 OK):**
    ```json
    {
      "message": "Senha removida com sucesso."
    }
    ```
