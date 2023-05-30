import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import { PREFIX } from '../constants';

export const bagikan = {
  command: PREFIX + 'bagikan',
  execute: async (message: Message, client: Client) => {
    const image = MessageMedia.fromFilePath('./src/assets/og-image.png');

    client.sendMessage(
      message.from,
      `Bagikan link bot ini kepada yang membutuhkan 🫡\nhttps://gilbot.hendraaagil.dev`,
      { media: image }
    );
  },
  generate: () => {},
};
