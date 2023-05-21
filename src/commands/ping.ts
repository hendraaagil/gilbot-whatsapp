import { Client, Message } from 'whatsapp-web.js';
import { PREFIX } from '../constants';

export const ping = {
  command: PREFIX + 'ping',
  execute: (message: Message, client: Client) => {
    client.sendMessage(message.from, '🏓 Pong!');
  },
  generate: () => {},
};
