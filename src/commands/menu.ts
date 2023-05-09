import { Client, Message } from 'whatsapp-web.js';
import { GREETINGS, PREFIX } from '../constants';

const randomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const menu = {
  command: PREFIX + 'menu',
  execute: async (message: Message, client: Client) => {
    const contact = await message.getContact();
    const greeting = GREETINGS[randomInteger(0, GREETINGS.length - 1)];

    client.sendMessage(
      message.from,
      `${greeting}, *${contact.name}*!\n\nDaftar perintah :\n1. *${PREFIX}tentang*, menampilkan informasi pembuat bot\n\nTerima kasih.`
    );
  },
};
