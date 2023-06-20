import puppeteer from 'puppeteer';
import { CurrentCommand } from '@prisma/client';
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
  }) => {
    const {
      currentCommand: { commandId, userId },
      message,
      client,
    } = args;

    const isCancelled = await checkCancelCommand(userId, message, client);
    if (isCancelled) return;

    await message.react('⏳');
    const { isValid, text, summarizeLink } = await launchSummarizeWebsite(
      message.body
    );

    if (isValid) {
      const result = [text, `Baca lebih lanjut: ${summarizeLink}`];
      await Promise.all([
        message.reply(result.join('\n\n'), message.from),
        updateLastCommand(userId, commandId as number),
      ]);

      await Promise.all([
        message.react('✅'),
        client.sendMessage(message.from, '✅ Selesai!'),
      ]);

      return resetCurrentCommand(userId);
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
