import { CurrentCommand } from '@prisma/client';
import {
  Client,
  Message,
  MessageMedia,
  MessageSendOptions,
} from 'whatsapp-web.js';

import { instaSave } from '../libs/insta';
import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';
import { InstaResult } from '../types/insta';

const downloadVideo = async (
  link: string
): Promise<{
  isSuccess: boolean;
  message: string;
  data?: InstaResult[];
}> => {
  try {
    const response = await instaSave(link);
    if (!response.isValid) {
      return {
        isSuccess: false,
        message: '⚠️ Link tidak valid!',
      };
    }

    return {
      isSuccess: true,
      message: '✅ Selesai!',
      data: response.data,
    };
  } catch (error: any) {
    console.log('Link:', link);
    console.error(error?.response?.data);

    return {
      isSuccess: false,
      message:
        '⚠️ Terdapat kesalahan saat mendownload. Silahkan coba beberapa saat lagi.',
    };
  }
};

export const insta = {
  command: PREFIX + 'insta',
  guide:
    '🔎 Silahkan kirim link reel / post Instagram yang ingin didownload.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, insta.guide);
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
    const result = await downloadVideo(message.body);

    if (result.isSuccess) {
      const items = result.data as InstaResult[];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const extension = item.type === 'image' ? '.jpg' : '.mp4';
        const media = await MessageMedia.fromUrl(item.url, {
          filename: item.name + extension,
          unsafeMime: true,
        });
        const messageOptions: MessageSendOptions = {
          sendMediaAsDocument: item.type === 'video',
          caption: item.type === 'video' ? item.name : undefined,
          media: media,
        };
        const messageContent = item.type === 'video' ? item.name : '';

        if (i < 1) {
          await message.reply(messageContent, message.from, messageOptions);
        } else {
          await client.sendMessage(
            message.from,
            messageContent,
            messageOptions
          );
        }
      }

      await Promise.all([
        message.react('✅'),
        client.sendMessage(message.from, result.message),
        updateLastCommand(userId, commandId as number),
      ]);

      return resetCurrentCommand(userId);
    }

    await Promise.all([
      message.reply(result.message, message.from),
      message.react('❌'),
    ]);
    return client.sendMessage(message.from, insta.guide);
  },
};
