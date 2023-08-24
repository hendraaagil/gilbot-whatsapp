import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import { PREFIX } from '../constants';
import axios from '../libs/axios';

const baseUrl = 'https://data.bmkg.go.id/DataMKG/TEWS/';
const mapsUrl = 'https://google.com/maps/place/';
const bmkgUrl = 'https://warning.bmkg.go.id';

export const gempa = {
  command: PREFIX + 'gempa',
  execute: async (message: Message, client: Client) => {
    const [response] = await Promise.all([
      axios.get(baseUrl + 'autogempa.json'),
      client.sendMessage(message.from, '🔎 Lagi nyari info...'),
    ]);
    const {
      Infogempa: { gempa },
    } = response.data;

    const text = [
      `📆 ${gempa.Tanggal}, ${gempa.Jam}`,
      `🚨 ${gempa.Magnitude} SR / ${gempa.Kedalaman}`,
      `📍 ${gempa.Wilayah}`,
      `🗺️ ${mapsUrl}${gempa.Coordinates}`,
      `🔗 ${bmkgUrl}`,
    ].join('\n');

    const image = await MessageMedia.fromUrl(baseUrl + gempa.Shakemap, {
      unsafeMime: true,
    });
    return client.sendMessage(message.from, text, { media: image });
  },
  generate: () => {},
};
