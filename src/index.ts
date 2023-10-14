import qrCode from 'qrcode-terminal';
import { Client, LocalAuth } from 'whatsapp-web.js';

import { listenMessages } from './events';
import { checkUnreplyChatsCron } from './libs/cron';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox'],
  },
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

  checkUnreplyChatsCron(client);
});

client.on('change_state', (state) => {
  console.log('State changed:', state);
});

client.on('message', (message) => {
  if (message.isStatus) return;

  listenMessages(message, client);
});

client.on('call', (call) => {
  console.log(`Call from: ${call.from}`);
  call.reject();
});

client.initialize();
