import { PrismaClient } from '@prisma/client';
import { Client, Message } from 'whatsapp-web.js';
import { halo } from '../commands';
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

export const listenMessages = async (
  message: Message,
  client: Client,
  prisma: PrismaClient
) => {
  const [command, log] = await Promise.all([
    findCommand(message.body, prisma),
    logMessage(message, prisma),
  ]);

  const currentCommand = await findCurrentCommand(log.userId, prisma);
  if (currentCommand) {
    return executeCurrentCommand(currentCommand, message, client, prisma);
  }

  if (!command) {
    return halo.execute(message, client);
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
};
