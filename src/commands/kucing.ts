import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import { PREFIX } from '../constants';
import axios from '../libs/axios';

export const kucing = {
  command: PREFIX + 'kucing',
  execute: async (message: Message, client: Client) => {
    const [response] = await Promise.all([
      axios.get('https://api.thecatapi.com/v1/images/search'),
      client.sendMessage(message.from, '🔎 Lagi nyari kucing...'),
    ]);

    const image = await MessageMedia.fromUrl(response.data[0]?.url, {
      unsafeMime: true,
    });
    return client.sendMessage(message.from, image);
  },
  generate: () => {},
};
