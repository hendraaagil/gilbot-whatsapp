import { Client, Message } from 'whatsapp-web.js';

import axios from '../libs/axios';
import { PREFIX } from '../constants';

export const quote = {
  command: PREFIX + 'quote',
  execute: async (message: Message, client: Client) => {
    await client.sendMessage(message.from, '🔎 Lagi nyari quote...');

    const response = await axios.get('https://kyoko.rei.my.id/api/quotes.php');
    const { apiResult } = response.data;
    const { english, indo, character, anime } = apiResult[0];
    const quote = `${indo}\n---\n_${english}_\n\n*~ ${character}*, ${anime}`;

    client.sendMessage(message.from, quote);
  },
  generate: () => {},
};
