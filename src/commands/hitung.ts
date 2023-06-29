import { CurrentCommand } from '@prisma/client';
import { evaluate } from 'mathjs';
import { Client, Message } from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';

export const hitung = {
  command: PREFIX + 'hitung',
  guide:
    '🔎 Silahkan ketik operasi matematika yang ingin dihiung. Gunakan *.* untuk desimal.\n_Contoh operasi: *12 + 3.4*_\n---\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, hitung.guide);
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

    await message.react('⏳');

    try {
      const result: number = evaluate(message.body);

      await Promise.all([
        message.reply(result.toLocaleString(), message.from),
        updateLastCommand(userId, commandId as number),
      ]);

      await Promise.all([
        message.react('✅'),
        client.sendMessage(message.from, '✅ Selesai!'),
      ]);

      return resetCurrentCommand(userId);
    } catch (error) {
      console.error(error);

      await Promise.all([
        message.react('❌'),
        message.reply('⚠️ Angka tidak valid!', message.from),
      ]);

      return client.sendMessage(message.from, hitung.guide);
    }
  },
};
