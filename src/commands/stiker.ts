import { CurrentCommand, PrismaClient } from '@prisma/client';
import { Client, Message } from 'whatsapp-web.js';
import { PREFIX } from '../constants';
import { resetCurrentCommand, updateLastCommand } from '../libs/command';
import { menu } from './menu';

export const stiker = {
  command: PREFIX + 'stiker',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(
      message.from,
      '🔎 Silahkan kirim gambar / gif / video yang ingin dijadikan stiker.\nKetik *batal* jika ingin membatalkan perintah.'
    );
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

    if (message.body.toLowerCase() === 'batal') {
      await Promise.all([
        client.sendMessage(message.from, '❌ Perintah dibatalkan.'),
        resetCurrentCommand(userId, prisma),
      ]);

      return menu.execute(message, client, prisma);
    }

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

      await Promise.all([
        message.react('✅'),
        updateLastCommand(userId, commandId as number, prisma),
      ]);
      await resetCurrentCommand(userId, prisma);

      return menu.execute(message, client, prisma);
    }

    client.sendMessage(
      message.from,
      '🔎 Silahkan kirim gambar / gif / video yang ingin dijadikan stiker.\nKetik *batal* jika ingin membatalkan perintah.'
    );
  },
};
