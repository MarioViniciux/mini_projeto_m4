import { pool } from '../utils/database.js';
import { encrypt, decrypt } from '../utils/crypto.js';

// Função para buscar as tags associadas a uma senha
const getTagsForPassword = async (passwordId) => {
    const query = `
        SELECT t.id, t.name FROM tags t
        INNER JOIN password_tags pt ON t.id = pt.tag_id
        WHERE pt.password_id = $1
    `;
    const result = await pool.query(query, [passwordId]);
    return result.rows;
};

// Função para gerenciar as tags associadas a uma senha
const manageTags = async (client, passwordId, tags) => {
  // Limpa as associações de tags antigas para esta senha
  await client.query('DELETE FROM password_tags WHERE password_id = $1', [passwordId]);

  if (!tags || tags.length === 0) {
    return []; // Retorna um array vazio se não houver tags
  }

  const tagObjects = [];
  for (const tagName of tags) {
    // Verifica se a tag existe ou a cria
    let tagResult = await client.query('SELECT id, name FROM tags WHERE name = $1', [tagName]);
    let tag = tagResult.rows[0];

    if (!tag) {
      const newTagResult = await client.query('INSERT INTO tags (name) VALUES ($1) RETURNING id, name', [tagName]);
      tag = newTagResult.rows[0];
    }
    
    tagObjects.push(tag);
    
    // Cria a nova associação
    await client.query('INSERT INTO password_tags (password_id, tag_id) VALUES ($1, $2)', [passwordId, tag.id]);
  }
  return tagObjects;
};

export const createPassword = async (req, res) => {
  const { service, password, email, username, notes, tags } = req.body;
  const encryptedPassword = encrypt(password);
  
  // Pega um cliente do pool para a transação
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Inicia a transação

    const passResult = await client.query(
      'INSERT INTO passwords (service, password, email, username, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [service, encryptedPassword, email, username, notes, req.user.id]
    );
    const passwordId = passResult.rows[0].id;

    const createdTags = await manageTags(client, passwordId, tags);

    await client.query('COMMIT'); // Confirma a transação se tudo deu certo

    res.status(201).json({
      id: passwordId,
      service,
      email,
      username,
      notes,
      tags: createdTags,
    });
  } catch (error) {
    await client.query('ROLLBACK'); // Desfaz a transação em caso de erro
    console.error('Erro ao criar senha:', error);
    res.status(500).json({ message: 'Erro ao criar a senha.' });
  } finally {
    client.release(); // Libera o cliente de volta para o pool
  }
};

export const updatePassword = async (req, res) => {
    const passwordId = req.params.id;
    const { service, password, email, username, notes, tags } = req.body;
    
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existingPassResult = await client.query('SELECT * FROM passwords WHERE id = $1 AND user_id = $2', [passwordId, req.user.id]);
        const existingPassword = existingPassResult.rows[0];

        if (!existingPassword) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Senha não encontrada ou não pertence a este usuário.' });
        }

        // Prepara os novos dados, mantendo os antigos se nada for enviado
        const newService = service !== undefined ? service : existingPassword.service;
        const newEmail = email !== undefined ? email : existingPassword.email;
        const newUsername = username !== undefined ? username : existingPassword.username;
        const newNotes = notes !== undefined ? notes : existingPassword.notes;
        const newEncryptedPassword = password ? encrypt(password) : existingPassword.password;

        await client.query(
            'UPDATE passwords SET service = $1, password = $2, email = $3, username = $4, notes = $5 WHERE id = $6',
            [newService, newEncryptedPassword, newEmail, newUsername, newNotes, passwordId]
        );

        let updatedTags = [];
        if (tags !== undefined) {
            updatedTags = await manageTags(client, passwordId, tags);
        } else {
            // Se as tags não forem enviadas, busca as existentes para retornar no objeto
            const existingTagsResult = await client.query(`
                SELECT t.id, t.name FROM tags t JOIN password_tags pt ON t.id = pt.tag_id WHERE pt.password_id = $1`, [passwordId]);
            updatedTags = existingTagsResult.rows;
        }

        await client.query('COMMIT');

        res.json({
            id: parseInt(passwordId, 10),
            service: newService,
            email: newEmail,
            username: newUsername,
            notes: newNotes,
            tags: updatedTags
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao atualizar senha:', error);
        res.status(500).json({ message: 'Erro ao atualizar a senha.' });
    } finally {
        client.release();
    }
};

export const getAllPasswords = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, service, email, username, notes FROM passwords WHERE user_id = $1 ORDER BY id DESC', [req.user.id]);
    const passwords = result.rows;

    // Para cada senha, busca e anexa suas tags
    for (const password of passwords) {
      password.tags = await getTagsForPassword(password.id);
    }
    
    res.json(passwords);
  } catch (error) {
    console.error('Erro ao buscar senhas:', error);
    res.status(500).json({ message: "Erro ao buscar senhas." });
  }
};

export const getPassword = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM passwords WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        const password = result.rows[0];

        if (!password) {
            return res.status(404).json({ message: 'Senha não encontrada ou não pertence a este usuário.' });
        }

        password.tags = await getTagsForPassword(password.id);
        password.password = decrypt(password.password);

        res.json(password);
    } catch (error) {
        console.error('Erro ao buscar senha:', error);
        res.status(500).json({ message: "Erro ao buscar a senha." });
    }
};

export const deletePassword = async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM passwords WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);

        // .rowCount informa quantas linhas foram afetadas
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Senha não encontrada ou não pertence a este usuário.' });
        }

        res.json({ message: 'Senha removida com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar senha:', error);
        res.status(500).json({ message: "Erro ao deletar a senha." });
    }
};