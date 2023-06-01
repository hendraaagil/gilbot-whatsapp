import { CurrentCommand, PrismaClient } from '@prisma/client';
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
    '🔎 Silahkan ketik operasi matematika yang ingin dihiung.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, hitung.guide);
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

    await message.react('⏳');

    try {
      const result: number = evaluate(message.body);

      await Promise.all([
        await message.react('✅'),
        message.reply(result.toLocaleString(), message.from),
        updateLastCommand(userId, commandId as number, prisma),
      ]);
      await client.sendMessage(message.from, '✅ Selesai!');

      return resetCurrentCommand(userId, prisma);
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
