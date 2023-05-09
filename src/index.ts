import qrCode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';

import { menu, ping, stiker, tentang } from './commands';

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

client.on('message', async (message) => {
  switch (message.body) {
    case ping.command:
      ping.execute(message, client);
      break;
    case menu.command:
      menu.execute(message, client);
      break;
    case stiker.command:
      stiker.execute(message, client);
      break;
    case tentang.command:
      tentang.execute(message, client);
      break;
    default:
      menu.execute(message, client);
      break;
  }
});

client.initialize();
