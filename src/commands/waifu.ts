import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import { PREFIX } from '../constants';
import axios from '../libs/axios';

export const waifu = {
  command: PREFIX + 'waifu',
  execute: async (message: Message, client: Client) => {
    const [response] = await Promise.all([
      axios.get('https://api.waifu.pics/sfw/waifu'),
      client.sendMessage(message.from, '🔎 Lagi nyari waifu...'),
    ]);
    const { url } = response.data;

    const image = await MessageMedia.fromUrl(url, {
      unsafeMime: true,
    });
    return client.sendMessage(message.from, image);
  },
  generate: () => {},
};
