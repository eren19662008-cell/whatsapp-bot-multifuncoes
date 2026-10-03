import fs from 'fs';
import path from 'path';
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  prepareWAMessageMedia,
  downloadMediaMessage,
  isJidGroup,
  jidNormalizedUser,
} from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import axios from 'axios';
import googleTTS from 'google-tts-api';
import { Sticker } from 'wa-sticker-formatter';
import yts from 'yt-search';
import Jimp from 'jimp';
import { config } from './config.js';

const state = {
  mutedGroups: new Set(),
  antiLinkGroups: new Set(),
  welcomeMessages: new Map(),
  goodbyeMessages: new Map(),
};

const allCommands = [
  '.menu',
  '.ping',
  '.play',
  '.yt',
  '.tts',
  '.sticker',
  '.s',
  '.take',
  '.toimg',
  '.tagall',
  '.hidetag',
  '.antilink',
  '.welcome',
  '.goodbye',
  '.mute',
  '.ban',
  '.promote',
  '.demote',
];

function formatText(text) {
  return String(text || '').trim();
}

function isAdminNumber(number, sender, message) {
  const normalized = jidNormalizedUser(number || sender || message?.key?.remoteJid || '')
    .replace(/[^\d]/g, '')
    .slice(-15);

  if (config.adminNumbers.includes(normalized)) return true;
  if (config.ownerNumber && jidNormalizedUser(config.ownerNumber).replace(/[^\d]/g, '').slice(-15) === normalized) {
    return true;
  }
  return false;
}

async function sendText(sock, jid, text, quoted = null) {
  await sock.sendMessage(jid, { text }, quoted ? { quoted } : {});
}

async function getGroupParticipants(sock, jid) {
  const metadata = await sock.groupMetadata(jid);
  return metadata.participants || [];
}

async function buildStickerFromMedia(mediaBuffer, packName = 'Bot Fun', authorName = 'Brincadeiras', type = 'image') {
  const sticker = new Sticker(mediaBuffer, {
    pack: packName,
    author: authorName,
    type,
    quality: 50,
    categories: ['🤖', '😄'],
  });

  return await sticker.build();
}

async function handleStickerCommand(sock, message, args, isQuotedMedia = false) {
  const remoteJid = message.key.remoteJid;
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  let mediaBuffer = null;

  if (isQuotedMedia) {
    mediaBuffer = await downloadMediaMessage(
      message,
      'buffer',
      {},
      { reuploadRequest: sock }
    );
  } else if (message.message?.imageMessage || message.message?.videoMessage || message.message?.stickerMessage) {
    mediaBuffer = await downloadMediaMessage(
      message,
      'buffer',
      {},
      { reuploadRequest: sock }
    );
  } else if (quoted && (quoted.imageMessage || quoted.videoMessage || quoted.stickerMessage)) {
    const quotedMedia = {
      key: message.message?.extendedTextMessage?.contextInfo?.stanzaId,
      message: quoted,
    };

    mediaBuffer = await downloadMediaMessage(
      quotedMedia,
      'buffer',
      {},
      { reuploadRequest: sock }
    );
  }

  if (!mediaBuffer) {
    return sendText(sock, remoteJid, '❗ Envie uma imagem ou vídeo para transformar em figurinha.');
  }

  const pack = args.join(' ') || 'Bot Fun';
  const stickerBuffer = await buildStickerFromMedia(mediaBuffer, pack, 'Bot de Brincadeiras', message.message?.videoMessage ? 'video' : 'image');

  await sock.sendMessage(remoteJid, {
    sticker: stickerBuffer,
  }, { quoted: message });
}

async function searchYoutube(term) {
  const result = await yts(term);
  const videos = result.videos.slice(0, 5);

  if (!videos.length) {
    return '❌ Nenhum resultado encontrado.';
  }

  return videos
    .map((video, index) => `${index + 1}. ${video.title}\n${video.url}`)
    .join('\n\n');
}

async function handleTTS(text) {
  const audioUrl = googleTTS.getAudioUrl(text, { lang: 'pt-BR', slow: false, host: 'https://translate.google.com' });
  return audioUrl;
}

async function mentionAll(sock, jid, text, hidden = false) {
  const metadata = await sock.groupMetadata(jid);
  const participants = metadata.participants || [];

  const mentions = participants.map((participant) => participant.id);
  const finalText = hidden ? `${text}\n\n${participants.map((p) => '@' + p.id.split('@')[0]).join(' ')}` : `${text}\n\n${participants.map((p) => '@' + p.id.split('@')[0]).join(' ')}`;

  await sock.sendMessage(jid, {
    text: finalText,
    mentions,
  });
}

async function handleCommand(sock, message, rawText) {
  const sender = message.key.participant || message.key.remoteJid;
  const remoteJid = message.key.remoteJid;
  const command = formatText(rawText).slice(config.prefix.length).trim();
  const [action, ...args] = command.split(/\s+/);
  const lowerAction = (action || '').toLowerCase();

  if (state.mutedGroups.has(remoteJid) && !['.menu', '.ping', '.help'].includes(config.prefix + lowerAction)) {
    return;
  }

  switch (lowerAction) {
    case 'menu': {
      const menu = [
        '🤖 *Menu do Bot*',
        '',
        '• .s / .sticker — transforma imagem ou vídeo em figurinha',
        '• .take — personaliza a figurinha com nome e autor',
        '• .toimg — converte figurinha em imagem',
        '• .menu — lista os comandos',
        '• .ping — verifica se o bot está online',
        '• .play — busca músicas',
        '• .yt — busca vídeos no YouTube',
        '• .tts — transforma texto em áudio',
        '• .tagall — marca todos do grupo',
        '• .hidetag — marca todos sem mostrar as menções',
        '• .antilink — ativa proteção contra links',
        '• .welcome — ativa mensagem de boas-vindas',
        '• .goodbye — ativa mensagem de despedida',
        '• .mute — silencia comandos do grupo',
        '• .ban — remove usuário do grupo (admin)',
        '• .promote — promove o usuário a admin',
        '• .demote — remove admin',
        '',
        '📌 Dica: digite .menu para ver a lista completa.'
      ].join('\n');
      return sendText(sock, remoteJid, menu, message);
    }

    case 'ping':
      return sendText(sock, remoteJid, '🏓 PONG! O bot está online e pronto para criar confusão.', message);

    case 'play': {
      const query = args.join(' ');
      if (!query) {
        return sendText(sock, remoteJid, '🎵 Use: .play Nome da música', message);
      }
      const resultText = await searchYoutube(query);
      return sendText(sock, remoteJid, resultText, message);
    }

    case 'yt': {
      const query = args.join(' ');
      if (!query) {
        return sendText(sock, remoteJid, '🎬 Use: .yt Nome do vídeo', message);
      }
      const resultText = await searchYoutube(query);
      return sendText(sock, remoteJid, resultText, message);
    }

    case 'tts': {
      const text = args.join(' ');
      if (!text) {
        return sendText(sock, remoteJid, '🔊 Use: .tts texto para transformar em áudio', message);
      }
      const audioUrl = await handleTTS(text);
      await sock.sendMessage(remoteJid, { audio: { url: audioUrl }, mimetype: 'audio/mpeg', ptt: false }, { quoted: message });
      return;
    }

    case 's':
    case 'sticker': {
      return handleStickerCommand(sock, message, args, true);
    }

    case 'take': {
      const text = args.join(' ');
      if (!text) {
        return sendText(sock, remoteJid, '✏️ Use: .take Nome da figurinha', message);
      }
      return handleStickerCommand(sock, message, [text], true);
    }

    case 'toimg': {
      return sendText(sock, remoteJid, '🖼️ Conversão de figurinha em imagem ainda em desenvolvimento. Tente enviar a imagem original e usar .s para criar uma figurinha.', message);
    }

    case 'tagall': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      const users = await getGroupParticipants(sock, remoteJid);
      const mentions = users.map((user) => user.id);
      await sock.sendMessage(remoteJid, {
        text: '📣 Menção geral do grupo!\n\n@todos',
        mentions,
      });
      return;
    }

    case 'hidetag': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      const users = await getGroupParticipants(sock, remoteJid);
      const mentions = users.map((user) => user.id);
      await sock.sendMessage(remoteJid, {
        text: '📣 Mensagem oculta para todos do grupo',
        mentions,
      });
      return;
    }

    case 'antilink': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      if (state.antiLinkGroups.has(remoteJid)) {
        state.antiLinkGroups.delete(remoteJid);
        return sendText(sock, remoteJid, '✅ Proteção contra links foi desativada.', message);
      }
      state.antiLinkGroups.add(remoteJid);
      return sendText(sock, remoteJid, '✅ Proteção contra links foi ativada.', message);
    }

    case 'mute': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      if (state.mutedGroups.has(remoteJid)) {
        state.mutedGroups.delete(remoteJid);
        return sendText(sock, remoteJid, '🔊 Comandos do grupo reativados.', message);
      }
      state.mutedGroups.add(remoteJid);
      return sendText(sock, remoteJid, '🔇 Comandos do grupo silenciados.', message);
    }

    case 'welcome': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      state.welcomeMessages.set(remoteJid, 'Bem-vindo(a) ao grupo! 😄');
      return sendText(sock, remoteJid, '✅ Mensagem de boas-vindas ativada.', message);
    }

    case 'goodbye': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      state.goodbyeMessages.set(remoteJid, 'Até mais! Foi um prazer te ver por aqui.');
      return sendText(sock, remoteJid, '✅ Mensagem de despedida ativada.', message);
    }

    case 'ban': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      const target = message.message?.extendedTextMessage?.contextInfo?.participant || args[0];
      if (!target) {
        return sendText(sock, remoteJid, '⚠️ Mencione ou informe o número do usuário.', message);
      }
      await sock.groupParticipantsUpdate(remoteJid, [target], 'remove');
      return sendText(sock, remoteJid, '✅ Usuário removido do grupo.', message);
    }

    case 'promote': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      const target = message.message?.extendedTextMessage?.contextInfo?.participant || args[0];
      if (!target) {
        return sendText(sock, remoteJid, '⚠️ Mencione ou informe o número do usuário.', message);
      }
      await sock.groupParticipantsUpdate(remoteJid, [target], 'promote');
      return sendText(sock, remoteJid, '✅ Usuário promovido a administrador.', message);
    }

    case 'demote': {
      if (!isJidGroup(remoteJid)) {
        return sendText(sock, remoteJid, '🚫 Esse comando só funciona em grupos.', message);
      }
      const target = message.message?.extendedTextMessage?.contextInfo?.participant || args[0];
      if (!target) {
        return sendText(sock, remoteJid, '⚠️ Mencione ou informe o número do usuário.', message);
      }
      await sock.groupParticipantsUpdate(remoteJid, [target], 'demote');
      return sendText(sock, remoteJid, '✅ Administração removida do usuário.', message);
    }

    default:
      return null;
  }
}

async function startBot() {
  const { state: authState, saveCreds } = await useMultiFileAuthState(path.join(process.cwd(), 'auth'));
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: authState,
    browser: ['Chrome', 'Ubuntu', '1.0.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) {
        startBot();
      }
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado ao WhatsApp');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const message = messages[0];
    if (!message || !message.key || message.key.fromMe) return;

    const remoteJid = message.key.remoteJid;
    if (!remoteJid) return;

    const messageText = message.message?.conversation
      || message.message?.extendedTextMessage?.text
      || '';

    if (!messageText.startsWith(config.prefix)) {
      const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted && messageText.toLowerCase().includes('link')) {
        // placeholder para regras extras
      }
      return;
    }

    await handleCommand(sock, message, messageText);
  });

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    const groupMessage = action === 'add'
      ? state.welcomeMessages.get(id)
      : state.goodbyeMessages.get(id);

    if (!groupMessage) return;

    const text = action === 'add'
      ? groupMessage
      : 'Até mais! Foi um prazer te ver por aqui.';

    const mentions = participants.map((p) => p);

    await sock.sendMessage(id, {
      text,
      mentions,
    });
  });

  return sock;
}

startBot().catch((error) => {
  console.error('Erro ao iniciar o bot:', error);
  process.exit(1);
});
