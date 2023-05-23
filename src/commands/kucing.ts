import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import { PREFIX } from '../constants';

export const kucing = {
  command: PREFIX + 'kucing',
  execute: async (message: Message, client: Client) => {
    await client.sendMessage(message.from, '🔎 Lagi nyari kucing...');
    const image = await MessageMedia.fromUrl('https://cataas.com/cat', {
      unsafeMime: true,
    });
    return client.sendMessage(message.from, image);
  },
  generate: () => {},
};
