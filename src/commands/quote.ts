import { Client, Message } from 'whatsapp-web.js';

import axios from '../libs/axios';
import { PREFIX } from '../constants';
import { randomInteger } from '../libs/generate';

export const quote = {
  command: PREFIX + 'quote',
  execute: async (message: Message, client: Client) => {
    await client.sendMessage(message.from, '🔎 Lagi nyari quote...');

    const response = await axios.get(
      'https://katanime.vercel.app/api/getrandom'
    );
    const { result } = response.data;
    const index = randomInteger(0, result.length - 1);

    const { english, indo, character, anime } = result[index];
    const quote = `${indo}\n---\n_${english}_\n\n*~ ${character}*, ${anime}`;

    client.sendMessage(message.from, quote);
  },
  generate: () => {},
};
