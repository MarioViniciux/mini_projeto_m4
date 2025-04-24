import fs from 'fs';

const DB_FILE = './mock_users_with_passwords.json';

export function readDatabase() {
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

export function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
