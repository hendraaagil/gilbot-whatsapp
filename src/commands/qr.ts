import QRCode from 'qrcode';
import { CurrentCommand, PrismaClient } from '@prisma/client';
import { Client, Message, MessageMedia } from 'whatsapp-web.js';
import { PREFIX } from '../constants';
import { resetCurrentCommand, updateLastCommand } from '../libs/command';
import { menu } from './menu';

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

    if (message.body.toLowerCase() === 'batal') {
      await Promise.all([
        client.sendMessage(message.from, '❌ Perintah dibatalkan.'),
        resetCurrentCommand(userId, prisma),
      ]);

      return menu.execute(message, client, prisma);
    }

    if (!message.hasMedia) {
      const qr = await QRCode.toDataURL(message.body, { width: 1080 });
      const image = new MessageMedia(
        'image/png',
        qr.replace('data:image/png;base64,', ''),
        'qr.png'
      );

      await Promise.all([
        message.react('⏳'),
        message.reply(image, message.from),
      ]);

      await Promise.all([
        message.react('✅'),
        updateLastCommand(userId, commandId as number, prisma),
      ]);
      await resetCurrentCommand(userId, prisma);

      return menu.execute(message, client, prisma);
    }

    client.sendMessage(message.from, qr.guide);
  },
};
