import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import { PREFIX } from '../constants';

export const tentang = {
  command: PREFIX + 'tentang',
  execute: async (message: Message, client: Client) => {
    const image = MessageMedia.fromFilePath('./src/assets/profile.png');

    client.sendMessage(
      message.from,
      `Pembuat bot ini adalah Hendra Agil. Kamu bisa cari tau lebih lanjut di: https://hendraaagil.dev/about 😎\n\nKamu juga bisa donasi untuk membantu biaya server bot ini: https://saweria.co/hendraaagil 🤘`,
      { media: image }
    );
  },
  generate: () => {},
};
