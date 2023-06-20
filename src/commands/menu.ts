import { Client, Message } from 'whatsapp-web.js';
import { PREFIX } from '../constants';
import prisma from '../libs/prisma';

export const menu = {
  command: PREFIX + 'menu',
  execute: async (message: Message, client: Client) => {
    const commands = await prisma.command.findMany({
      orderBy: { position: 'asc' },
    });
    const listCommands = commands.map(
      (command) =>
        `${command.position}. *${PREFIX}${command.name}*, ${command.description}`
    );

    client.sendMessage(
      message.from,
      `📃 Daftar perintah yang tersedia :\n\n${listCommands.join('\n')}`
    );
  },
  generate: () => {},
};
