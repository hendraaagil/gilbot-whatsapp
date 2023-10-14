import { Client, Message } from 'whatsapp-web.js';
import { GREETINGS, PREFIX } from '../constants';
import { randomInteger } from '../libs/generate';

const getPushname = async (message: Message) => {
  try {
    const contact = await message.getContact();
    return contact.pushname;
  } catch (error) {
    return null;
  }
};

export const halo = {
  execute: async (message: Message, client: Client) => {
    const pushname = await getPushname(message);
    const greeting = GREETINGS[randomInteger(0, GREETINGS.length - 1)];

    client.sendMessage(
      message.from,
      `${greeting}, *${
        pushname || 'bro'
      }*! 👋\n\nSilahkan ketik *${PREFIX}menu* untuk menampilkan daftar perintah yang tersedia.`
    );
  },
  generate: () => {},
};
