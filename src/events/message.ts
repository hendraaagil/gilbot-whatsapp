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

export const listenMessages = async (message: Message, client: Client) => {
  try {
    const [command, log] = await Promise.all([
      findCommand(message.body),
      logMessage(message),
    ]);

    const isBanned = await checkBanUser(log.userId);
    if (isBanned) {
      return client.sendMessage(
        message.from,
        '❌ Akun kamu telah diban. Silahkan hubungi pembuat bot. https://t.me/hendraaagil'
      );
    }

    const currentCommand = await findCurrentCommand(log.userId);
    if (currentCommand) {
      return executeCurrentCommand(currentCommand, message, client);
    }

    if (!command) {
      return commands.halo.execute(message, client);
    }

    const { isExceedLimit } = await checkLimitCommand(
      log.userId,
      command,
      message,
      client
    );
    if (isExceedLimit) return;

    executeCommand(message, client);
    if (command.requireLock) {
      updateCurrentCommand(log.userId, command.id);
    } else {
      updateLastCommand(log.userId, command.id);
    }
  } catch (error) {
    console.error(error);
  }
};
