import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const ROOT = process.cwd();

export const config = {
  botName: process.env.BOT_NAME || '🤖 Bot de Brincadeiras',
  prefix: process.env.COMMAND_PREFIX || '.',
  ownerNumber: process.env.OWNER_NUMBER || null,
  sessionName: process.env.SESSION_NAME || 'bot_session',
  adminNumbers: (process.env.ADMIN_NUMBERS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  dataDir: path.join(ROOT, 'data'),
  authDir: path.join(ROOT, 'auth'),
};

if (!fs.existsSync(config.dataDir)) {
  fs.mkdirSync(config.dataDir, { recursive: true });
}

if (!fs.existsSync(config.authDir)) {
  fs.mkdirSync(config.authDir, { recursive: true });
}
