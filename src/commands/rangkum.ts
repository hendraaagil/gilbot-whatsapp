import puppeteer from 'puppeteer';
import { CurrentCommand, PrismaClient } from '@prisma/client';
import { Client, Message } from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';

const launchSummarizeWebsite = async (youtubeLink: string) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  const summarizeLink = 'https://www.summarize.tech/' + youtubeLink;

  await page.goto(summarizeLink, {
    waitUntil: 'networkidle0',
  });

  const content = await page.$('section > p');
  if (!content) {
    await browser.close();
    return { isValid: false, text: '', summarizeLink };
  }

  const text = await page.evaluate(
    `document.querySelector('section > p').textContent`
  );
  await browser.close();
  return { isValid: true, text: text, summarizeLink };
};

export const rangkum = {
  command: PREFIX + 'rangkum',
  guide:
    '🔎 Silahkan kirim link video YouTube yang ingin dirangkum.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, rangkum.guide);
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
    const { isValid, text, summarizeLink } = await launchSummarizeWebsite(
      message.body
    );

    if (isValid) {
      const result = [text, `Baca lebih lanjut: ${summarizeLink}`];
      await Promise.all([
        message.reply(result.join('\n\n'), message.from),
        message.react('✅'),
        updateLastCommand(userId, commandId as number, prisma),
      ]);

      await resetCurrentCommand(userId, prisma);
      return client.sendMessage(message.from, '✅ Selesai!');
    }

    await Promise.all([
      message.reply(
        '⚠️ Link tidak valid / video tidak dapat dirangkum.',
        message.from
      ),
      message.react('❌'),
    ]);
    client.sendMessage(message.from, rangkum.guide);
  },
};
