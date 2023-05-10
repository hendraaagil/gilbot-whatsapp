import { Client, Message } from 'whatsapp-web.js';
import { GREETINGS, PREFIX } from '../constants';
import { randomInteger } from '../libs/generate';

export const menu = {
  command: PREFIX + 'menu',
  execute: async (message: Message, client: Client) => {
    const contact = await message.getContact();
    const greeting = GREETINGS[randomInteger(0, GREETINGS.length - 1)];

    client.sendMessage(
      message.from,
      `${greeting}, *${contact.pushname}*! 👋\n\nDaftar perintah yang tersedia :\n1. *${PREFIX}stiker*, membuat stiker dari gambar / gif / video\n2. *${PREFIX}tentang*, menampilkan informasi pembuat bot\n\nTerima kasih.`
    );
  },
};
