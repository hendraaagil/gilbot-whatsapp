import { PrismaClient } from '@prisma/client';
import { Client, Message } from 'whatsapp-web.js';
import { halo, menu, ping, stiker, tentang } from '../commands';
import { logMessage } from '../libs/log';

export const listenMessages = async (
  message: Message,
  client: Client,
  prisma: PrismaClient
) => {
  await logMessage(message, prisma);

  switch (message.body) {
    case ping.command:
      ping.execute(message, client);
      break;
    case menu.command:
      menu.execute(message, client);
      break;
    case stiker.command:
      stiker.execute(message, client);
      break;
    case tentang.command:
      tentang.execute(message, client);
      break;
    default:
      halo.execute(message, client);
      break;
  }
};
