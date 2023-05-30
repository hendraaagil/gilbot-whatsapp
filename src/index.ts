import qrCode from 'qrcode-terminal';
import { PrismaClient } from '@prisma/client';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { listenMessages } from './events';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox'],
    // executablePath:
    //   'C://Program Files//Google//Chrome//Application//chrome.exe',
  },
});

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

client.on('qr', (qr) => {
  qrCode.generate(qr, { small: true });
});

client.on('ready', () => {
  const {
    pushname,
    wid: { user },
  } = client.info;

  console.log('Client is ready!');
  console.log(`Logged in as: ${pushname} | ${user}`);
});

client.on('change_state', (state) => {
  console.log('State changed:', state);
});

client.on('message', (message) => {
  if (message.isStatus) return;

  listenMessages(message, client, prisma);
});

client.initialize();
