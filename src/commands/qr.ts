import QRCode from 'qrcode';
import { CurrentCommand, PrismaClient } from '@prisma/client';
import { Client, Message, MessageMedia } from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';

export const qr = {
  command: PREFIX + 'qr',
  guide:
    '🔎 Silahkan kirim teks / link yang ingin dijadikan QR.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, qr.guide);
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

    if (!message.hasMedia) {
      await message.react('⏳');

      const qr = await QRCode.toDataURL(message.body, { width: 1080 });
      const image = new MessageMedia(
        'image/png',
        qr.replace('data:image/png;base64,', ''),
        'qr.png'
      );

      await Promise.all([
        message.reply(image, message.from),
        message.react('✅'),
        updateLastCommand(userId, commandId as number, prisma),
      ]);

      await resetCurrentCommand(userId, prisma);
      return client.sendMessage(message.from, '✅ Selesai!');
    }

    client.sendMessage(message.from, qr.guide);
  },
};
