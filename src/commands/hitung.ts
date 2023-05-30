import { CurrentCommand, PrismaClient } from '@prisma/client';
import { evaluate } from 'mathjs';
import { Client, Message } from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import { resetCurrentCommand, updateLastCommand } from '../libs/command';
import { menu } from './menu';

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

    if (message.body.toLowerCase() === 'batal') {
      await Promise.all([
        client.sendMessage(message.from, '❌ Perintah dibatalkan.'),
        resetCurrentCommand(userId, prisma),
      ]);

      return menu.execute(message, client, prisma);
    }

    await message.react('⏳');

    let resultString = '';
    try {
      const result: number = evaluate(message.body);
      resultString = result.toLocaleString();

      await message.react('✅');
    } catch (error) {
      console.error(error);
      resultString = 'Angka tidak valid!';

      await message.react('❌');
    }

    await Promise.all([
      message.reply(resultString, message.from),
      updateLastCommand(userId, commandId as number, prisma),
    ]);
    return resetCurrentCommand(userId, prisma);
  },
};
