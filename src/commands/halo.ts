import { Client, Message } from 'whatsapp-web.js';
import { GREETINGS, PREFIX } from '../constants';
import { randomInteger } from '../libs/generate';

export const halo = {
  execute: async (message: Message, client: Client) => {
    const contact = await message.getContact();
    const greeting = GREETINGS[randomInteger(0, GREETINGS.length - 1)];

    client.sendMessage(
      message.from,
      `${greeting}, *${
        contact.pushname || 'bro'
      }*! 👋\n\nSilahkan ketik *${PREFIX}menu* untuk menampilkan daftar perintah yang tersedia.`
    );
  },
  generate: () => {},
};
