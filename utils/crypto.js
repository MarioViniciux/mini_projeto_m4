import 'dotenv/config';
import crypto from 'crypto';

// Algoritmo de criptografia utilizado
const ALGORITHM = 'aes-256-ctr';
// Chave de criptografia obtida das variáveis de ambiente (deve ter 32 bytes)
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

// Garante que a chave tem o tamanho correto
if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('A ENCRYPTION_KEY deve ter 64 caracteres hexadecimais (32 bytes).');
}

// Função para criptografar um texto (senha)
export const encrypt = (text) => {
    // Gera um IV (vetor de inicialização) aleatório
    const iv = crypto.randomBytes(16);
    // Cria o objeto de cifra
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    // Criptografa o texto
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    // Retorna o IV e o texto criptografado em formato hex, separados por ':'
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Função para descriptografar um texto criptografado
export const decrypt = (hash) => {
    try {
        // Separa o IV do texto criptografado
        const parts = hash.split(':');
        if (parts.length !== 2) throw new Error('Hash de criptografia inválido.');
        
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        // Cria o objeto de decifra
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        // Descriptografa o texto
        const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        console.error("Erro ao decriptografar:", error);
        return null; 
    }
};