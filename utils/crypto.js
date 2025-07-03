import 'dotenv/config';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-ctr';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('A ENCRYPTION_KEY deve ter 64 caracteres hexadecimais (32 bytes).');
}

export const encrypt = (text) => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decrypt = (hash) => {
    try {
        const parts = hash.split(':');
        if (parts.length !== 2) throw new Error('Hash de criptografia inválido.');
        
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Erro ao decriptografar:", error);
        return null; 
    }
};