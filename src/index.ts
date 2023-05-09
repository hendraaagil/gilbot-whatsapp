import qrCode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';
import { listenMessages } from './events';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ['--no-sandbox'] },
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

client.on('message', (message) => {
  listenMessages(message, client);
});

client.initialize();
