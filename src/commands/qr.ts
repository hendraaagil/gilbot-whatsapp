import QRCode from 'qrcode';
import { CurrentCommand } from '@prisma/client';
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
  }) => {
    const {
      currentCommand: { commandId, userId },
      message,
      client,
    } = args;

    const isCancelled = await checkCancelCommand(userId, message, client);
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
        updateLastCommand(userId, commandId as number),
      ]);

      await Promise.all([
        message.react('✅'),
        client.sendMessage(message.from, '✅ Selesai!'),
      ]);

      return resetCurrentCommand(userId);
    }

    client.sendMessage(message.from, qr.guide);
  },
};
