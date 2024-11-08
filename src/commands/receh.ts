import { Client, Message, MessageMedia } from 'whatsapp-web.js';

import axios from '../libs/axios';
import { PREFIX } from '../constants';
import { randomInteger } from '../libs/generate';

export const receh = {
  command: PREFIX + 'receh',
  execute: async (message: Message, client: Client) => {
    await client.sendMessage(message.from, '🔎 Lagi nyari receh...');

    const types = ['text', 'image'];
    const type = types[randomInteger(0, types.length - 1)];
    const response = await axios.get(
      'https://candaan-api.vercel.app/api/' + type + '/random'
    );
    const { data } = response.data;

    if (data.url) {
      const image = await MessageMedia.fromUrl(data.url);
      return client.sendMessage(message.from, image);
    }
    client.sendMessage(message.from, data);
  },
  generate: () => {},
};
