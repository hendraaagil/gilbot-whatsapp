import { CurrentCommand, PrismaClient } from '@prisma/client';
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
    prisma: PrismaClient;
  }) => {
    const {
      currentCommand: { commandId, userId },
      message,
      client,
      prisma,
    } = args;

    const isCancelled = await checkCancelCommand(
      userId,
      message,
      client,
      prisma
    );
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
        message.react('✅'),
        updateLastCommand(userId, commandId as number, prisma),
      ]);

      await resetCurrentCommand(userId, prisma);
      return client.sendMessage(message.from, '✅ Selesai!');
    }

    client.sendMessage(message.from, stiker.guide);
  },
};
