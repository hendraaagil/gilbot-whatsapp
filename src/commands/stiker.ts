import { Client, Message } from 'whatsapp-web.js';
import { PREFIX } from '../constants';

export const stiker = {
  command: PREFIX + 'stiker',
  execute: async (message: Message, client: Client) => {
    if (message.hasMedia) {
      const image = await message.downloadMedia();

      await Promise.all([
        message.react('⏳'),
        message.reply(image, message.from, {
          sendMediaAsSticker: true,
          stickerName: 'stiker',
          stickerAuthor: 'GilBot',
        }),
      ]);

      message.react('✅');
    } else {
      client.sendMessage(
        message.from,
        'Untuk membuat stiker, silahkan kirim gambar disertai caption /stiker'
      );
    }
  },
};
