import { openDb } from '../utils/database.js';
import { encrypt, decrypt } from '../utils/crypto.js';

const manageTags = async (db, passwordId, tags) => {
  await db.run('DELETE FROM password_tags WHERE password_id = ?', passwordId);

  if (!tags || tags.length === 0) {
    return [];
  }

  const tagObjects = [];
  for (const tagName of tags) {
    let tag = await db.get('SELECT * FROM tags WHERE name = ?', tagName);
    if (!tag) {
      const result = await db.run('INSERT INTO tags (name) VALUES (?)', tagName);
      tag = { id: result.lastID, name: tagName };
    }
    tagObjects.push(tag);
    await db.run('INSERT INTO password_tags (password_id, tag_id) VALUES (?, ?)', passwordId, tag.id);
  }
  return tagObjects;
};

export const createPassword = async (req, res) => {
  const { service, password, email, username, notes, tags } = req.body;
  const encryptedPassword = encrypt(password);
  const db = await openDb();

  try {
    await db.exec('BEGIN TRANSACTION'); 

    const result = await db.run(
      'INSERT INTO passwords (service, password, email, username, notes, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      service, encryptedPassword, email, username, notes, req.user.id
    );
    const passwordId = result.lastID;

    const createdTags = await manageTags(db, passwordId, tags);

    await db.exec('COMMIT');

    res.status(201).json({
      id: passwordId,
      service,
      email,
      username,
      notes,
      tags: createdTags,
    });
  } catch (error) {
    await db.exec('ROLLBACK'); 
    res.status(500).json({ message: 'Erro ao criar a senha.', error: error.message });
  }
};

export const updatePassword = async (req, res) => {
    const { service, password, email, username, notes, tags } = req.body;
    const passwordId = req.params.id;
    const db = await openDb();

    try {
        await db.exec('BEGIN TRANSACTION');

        const existingPassword = await db.get('SELECT * FROM passwords WHERE id = ? AND user_id = ?', passwordId, req.user.id);
        if (!existingPassword) {
            await db.exec('ROLLBACK');
            return res.status(404).json({ message: 'Senha não encontrada ou não pertence a este usuário.' });
        }

        const newService = service !== undefined ? service : existingPassword.service;
        const newEmail = email !== undefined ? email : existingPassword.email;
        const newUsername = username !== undefined ? username : existingPassword.username;
        const newNotes = notes !== undefined ? notes : existingPassword.notes;
        const newEncryptedPassword = password ? encrypt(password) : existingPassword.password;

        await db.run(
            'UPDATE passwords SET service = ?, password = ?, email = ?, username = ?, notes = ? WHERE id = ?',
            newService, newEncryptedPassword, newEmail, newUsername, newNotes, passwordId
        );

        const updatedTags = tags !== undefined ? await manageTags(db, passwordId, tags) : await getTagsForPassword(db, passwordId);

        await db.exec('COMMIT');

        res.json({
            id: parseInt(passwordId, 10),
            service: newService,
            email: newEmail,
            username: newUsername,
            notes: newNotes,
            tags: updatedTags
        });
    } catch (error) {
        await db.exec('ROLLBACK');
        res.status(500).json({ message: 'Erro ao atualizar a senha.', error: error.message });
    }
};

const getTagsForPassword = async (db, passwordId) => {
    return await db.all(`
        SELECT t.id, t.name FROM tags t
        INNER JOIN password_tags pt ON t.id = pt.tag_id
        WHERE pt.password_id = ?
    `, passwordId);
};


export const getAllPasswords = async (req, res) => {
  const db = await openDb();
  const passwords = await db.all('SELECT id, service, email, username, notes FROM passwords WHERE user_id = ?', req.user.id);

  for (const password of passwords) {
    password.tags = await getTagsForPassword(db, password.id);
  }

  res.json(passwords);
};

export const getPassword = async (req, res) => {
    const db = await openDb();
    const password = await db.get('SELECT * FROM passwords WHERE id = ? AND user_id = ?', req.params.id, req.user.id);

    if (!password) {
        return res.status(404).json({ message: 'Senha não encontrada ou não pertence a este usuário.' });
    }

    const tags = await getTagsForPassword(db, password.id);
    const decryptedPassword = decrypt(password.password);

    res.json({
      id: password.id,
      service: password.service,
      password: decryptedPassword,
      email: password.email,
      username: password.username,
      notes: password.notes,
      tags: tags
    });
};

export const deletePassword = async (req, res) => {
    const db = await openDb();
    const result = await db.run('DELETE FROM passwords WHERE id = ? AND user_id = ?', req.params.id, req.user.id);

    if (result.changes === 0) {
        return res.status(404).json({ message: 'Senha não encontrada ou não pertence a este usuário.' });
    }

    res.json({ message: 'Senha removida com sucesso.' });
};