import puppeteer from 'puppeteer';
import { CurrentCommand, PrismaClient } from '@prisma/client';
import { Client, Message } from 'whatsapp-web.js';
import { PREFIX } from '../constants';
import { resetCurrentCommand, updateLastCommand } from '../libs/command';
import { menu } from './menu';

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

    if (message.body.toLowerCase() === 'batal') {
      await Promise.all([
        client.sendMessage(message.from, '❌ Perintah dibatalkan.'),
        resetCurrentCommand(userId, prisma),
      ]);

      return menu.execute(message, client, prisma);
    }

    await message.react('⏳');
    const { isValid, text, summarizeLink } = await launchSummarizeWebsite(
      message.body
    );

    if (isValid) {
      const result = [text, `Read more: ${summarizeLink}`];
      await Promise.all([
        message.reply(result.join('\n\n'), message.from),
        message.react('✅'),
        updateLastCommand(userId, commandId as number, prisma),
      ]);

      return resetCurrentCommand(userId, prisma);
    }

    await message.react('❌');
    client.sendMessage(message.from, rangkum.guide);
  },
};
