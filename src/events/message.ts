import { PrismaClient } from '@prisma/client';
import { Client, Message } from 'whatsapp-web.js';
import { commands } from '../commands';
import { logMessage } from '../libs/log';
import {
  checkLimitCommand,
  executeCommand,
  executeCurrentCommand,
  findCommand,
  findCurrentCommand,
  updateCurrentCommand,
  updateLastCommand,
} from '../libs/command';
import { checkBanUser } from '../libs/user';

export const listenMessages = async (
  message: Message,
  client: Client,
  prisma: PrismaClient
) => {
  try {
    const [command, log] = await Promise.all([
      findCommand(message.body, prisma),
      logMessage(message, prisma),
    ]);

    const isBanned = await checkBanUser(log.userId, prisma);
    if (isBanned) {
      return client.sendMessage(
        message.from,
        '❌ Akun kamu telah diban. Silahkan hubungi pembuat bot.'
      );
    }

    const currentCommand = await findCurrentCommand(log.userId, prisma);
    if (currentCommand) {
      return executeCurrentCommand(currentCommand, message, client, prisma);
    }

    if (!command) {
      return commands.halo.execute(message, client);
    }

    const { isExceedLimit } = await checkLimitCommand(
      log.userId,
      command,
      message,
      client,
      prisma
    );
    if (isExceedLimit) return;

    executeCommand(message, client, prisma);
    if (command.requireLock) {
      updateCurrentCommand(log.userId, command.id, prisma);
    } else {
      updateLastCommand(log.userId, command.id, prisma);
    }
  } catch (error) {
    console.error(error);
  }
};
