import { CurrentCommand } from '@prisma/client';
import {
  Client,
  Message,
  MessageMedia,
  MessageSendOptions,
} from 'whatsapp-web.js';

import axios from '../libs/axios';
import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';
import { ApiTwitterResponse, TwitterResult } from '../types/twitter';

const downloadMedia = async (link: string): Promise<TwitterResult> => {
  try {
    const twitterUrl = new URL(link);
    const apiUrl = new URL('https://api.vxtwitter.com');
    apiUrl.pathname = twitterUrl.pathname;

    const response = await axios.get<ApiTwitterResponse>(apiUrl.toString());
    const media = response.data.media_extended.map((item, index) => ({
      name:
        response.data.user_screen_name +
        '_' +
        response.data.tweetID +
        '_' +
        (index + 1),
      type: item.type,
      url: item.url,
    }));

    return {
      isSuccess: true,
      message: '✅ Selesai!',
      data: {
        name: response.data.user_name,
        username: response.data.user_screen_name,
        text: response.data.text,
        replies: response.data.replies,
        retweets: response.data.retweets,
        media: media,
      },
    };
  } catch (error: any) {
    console.error(error?.response?.data);

    return {
      isSuccess: false,
      message:
        '⚠️ Tweet tidak ditemukan!\n\nAlasan yang mungkin terjadi:\n- Link tidak valid,\n- Perubahan pada API Twitter,\n- Atau akun yang private.',
    };
  }
};

export const twitter = {
  command: PREFIX + 'twitter',
  guide:
    '🔎 Silahkan kirim link Twitter (X) yang ingin didownload.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, twitter.guide);
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

    const result = await downloadMedia(message.body);
    if (!result.isSuccess) {
      await Promise.all([
        message.reply(result.message, message.from),
        message.react('❌'),
      ]);
      return client.sendMessage(message.from, twitter.guide);
    }

    for (let i = 0; i < result.data.media.length; i++) {
      const item = result.data.media[i];

      const media = await MessageMedia.fromUrl(item.url, {
        filename: item.name + (item.type === 'image' ? '.jpg' : '.mp4'),
        unsafeMime: true,
      });
      const messageOptions: MessageSendOptions = {
        sendMediaAsDocument: item.type !== 'image',
        caption: item.type === 'image' ? undefined : item.name,
        media: media,
      };
      const messageContent = item.type === 'image' ? '' : item.name;

      if (i < 1) {
        await message.reply(messageContent, message.from, messageOptions);
      } else {
        await client.sendMessage(message.from, messageContent, messageOptions);
      }
    }
    await client.sendMessage(
      message.from,
      `*@${result.data.username} (${result.data.name})*\n\n${result.data.text}\n\n🔁 Retweets: ${result.data.retweets}\n🧵 Replies: ${result.data.replies}`
    );

    await Promise.all([
      message.react('✅'),
      client.sendMessage(message.from, result.message),
      updateLastCommand(userId, commandId as number),
    ]);

    return resetCurrentCommand(userId);
  },
};
