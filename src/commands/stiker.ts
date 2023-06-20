import { CurrentCommand } from '@prisma/client';
import { Client, Message } from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';

export const stiker = {
  command: PREFIX + 'stiker',
  guide:
    '🔎 Silahkan kirim gambar / gif / video yang ingin dijadikan stiker.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, stiker.guide);
  },
  generate: async (args: {
    currentCommand: CurrentCommand;
    message: Message;
    client: Client;
  }) => {
    const {
      currentCommand: { commandId, userId },
      message,
      client,
    } = args;

    const isCancelled = await checkCancelCommand(userId, message, client);
    if (isCancelled) return;

    if (message.hasMedia) {
      await message.react('⏳');

      const image = await message.downloadMedia();
      await Promise.all([
        message.reply(image, message.from, {
          sendMediaAsSticker: true,
          stickerName: 'stiker',
          stickerAuthor: 'GilBot',
        }),
        updateLastCommand(userId, commandId as number),
      ]);

      await Promise.all([
        message.react('✅'),
        client.sendMessage(message.from, '✅ Selesai!'),
      ]);

      return resetCurrentCommand(userId);
    }

    client.sendMessage(message.from, stiker.guide);
  },
};
