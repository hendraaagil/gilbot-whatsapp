import { Command, CurrentCommand } from '@prisma/client';
import { differenceInSeconds } from 'date-fns';
import { Client, Message } from 'whatsapp-web.js';

import prisma from './prisma';
import { commands } from '../commands';
import { PREFIX } from '../constants';
import { toLowerCase } from './format';

export const findCommand = async (message: string) => {
  if (message.slice(0, 1) !== PREFIX) {
    return null;
  }

  return await prisma.command.findUnique({
    where: { name: toLowerCase(message.slice(PREFIX.length)) },
  });
};

export const findCurrentCommand = async (userId: number) => {
  return await prisma.currentCommand.findFirst({
    where: { userId: userId, NOT: { commandId: null } },
  });
};

export const checkLimitCommand = async (
  userId: number,
  command: Command,
  message: Message,
  client: Client
) => {
  const lastCommand = await prisma.lastUsedCommand.findFirst({
    where: { userId: userId, commandId: command.id },
  });
  if (!lastCommand) {
    return { isExceedLimit: false };
  }

  const diff = differenceInSeconds(new Date(), new Date(lastCommand.usedAt));
  const limitInSeconds = command.minuteLimit * 60;
  if (diff < limitInSeconds) {
    const trySeconds = limitInSeconds - diff;

    const diffSeconds = trySeconds % 60;
    const diffMinutes = (trySeconds - diffSeconds) / 60;

    const tryIn: string[] = [];
    if (diffMinutes > 0) {
      tryIn.push(`${diffMinutes} menit`);
    }
    if (diffSeconds > 0) {
      tryIn.push(`${diffSeconds} detik`);
    }

    client.sendMessage(
      message.from,
      `⏳ Kamu sudah menggunakan perintah tersebut dalam ${
        command.minuteLimit
      } menit terakhir.\nSilahkan coba lagi dalam ${tryIn.join(' ')}.`
    );
    return { isExceedLimit: true };
  }

  return { isExceedLimit: false };
};

export const checkCancelCommand = async (
  userId: number,
  message: Message,
  client: Client
) => {
  let isCancelled = false;

  if (message.body.toLowerCase() === 'batal') {
    isCancelled = true;
    await Promise.all([
      client.sendMessage(message.from, '❌ Perintah dibatalkan.'),
      resetCurrentCommand(userId),
    ]);
    await commands.menu.execute(message, client);
  }

  return isCancelled;
};

export const executeCommand = (message: Message, client: Client) => {
  commands[
    toLowerCase(message.body.slice(PREFIX.length)) as keyof typeof commands
  ].execute(message, client);
};

export const executeCurrentCommand = async (
  currentCommand: CurrentCommand,
  message: Message,
  client: Client
) => {
  const command = await prisma.command.findUnique({
    where: { id: currentCommand.commandId as number },
  });

  commands[command?.name as keyof typeof commands].generate({
    currentCommand,
    message,
    client,
  });
};

export const updateCurrentCommand = async (
  userId: number,
  commandId: number
) => {
  const currentCommand = await prisma.currentCommand.findFirst({
    where: { userId: userId },
  });

  if (currentCommand) {
    return await prisma.currentCommand.update({
      where: { id: currentCommand.id },
      data: { commandId: commandId },
    });
  }
  return await prisma.currentCommand.create({
    data: { userId: userId, commandId: commandId },
  });
};

export const resetCurrentCommand = async (userId: number) => {
  return await prisma.currentCommand.update({
    where: { userId: userId },
    data: { commandId: null },
  });
};

export const updateLastCommand = async (userId: number, commandId: number) => {
  const criteria = { userId: userId, commandId: commandId };

  const lastCommand = await prisma.lastUsedCommand.findFirst({
    where: criteria,
  });

  if (lastCommand) {
    return await prisma.lastUsedCommand.update({
      where: { id: lastCommand.id },
      data: { usedAt: new Date() },
    });
  }
  return await prisma.lastUsedCommand.create({ data: criteria });
};
