import axios from 'axios';
import { CurrentCommand, PrismaClient } from '@prisma/client';
import { Client, Message, MessageMedia } from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import { resetCurrentCommand, updateLastCommand } from '../libs/command';
import { menu } from './menu';

const downloadVideo = async (
  link: string
): Promise<{
  isSuccess: boolean;
  message: string;
  video?: {
    authorId: string;
    id: number;
    title: string;
    url: string;
  };
}> => {
  try {
    const response = await axios.get(
      'https://api.tiklydown.me/api/download?url=' + link
    );

    return {
      isSuccess: true,
      message: '✅ Selesai!',
      video: {
        authorId: response.data.author.unique_id,
        id: response.data.id,
        title: response.data.title,
        url: response.data.video.noWatermark,
      },
    };
  } catch (error: any) {
    console.log('Link:', link);
    console.error(error?.response?.data);

    if (error.response?.data?.status === 404) {
      return {
        isSuccess: false,
        message: '⚠️ Video tidak ditemukan / link tidak valid!',
      };
    }

    return {
      isSuccess: false,
      message: '⚠️ Terdapat kesalahan saat mendownload video.',
    };
  }
};

export const tiktok = {
  command: PREFIX + 'tiktok',
  guide:
    '🔎 Silahkan kirim link TikTok yang ingin didownload.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, tiktok.guide);
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

    const result = await downloadVideo(message.body);
    console.log('FETCH TikTok >>', result);

    if (result.isSuccess) {
      const { video } = result;
      const title = video?.id + '_' + (video?.authorId as string);
      const videoMedia = await MessageMedia.fromUrl(video?.url as string, {
        filename: title + '.mp4',
        unsafeMime: true,
      });

      await message.reply('✅', message.from, {
        sendMediaAsDocument: true,
        caption: title,
        media: videoMedia,
      });

      await Promise.all([
        message.react('✅'),
        client.sendMessage(message.from, result.message),
        updateLastCommand(userId, commandId as number, prisma),
      ]);

      return resetCurrentCommand(userId, prisma);
    }

    await Promise.all([
      message.reply(result.message, message.from),
      message.react('❌'),
    ]);
    return client.sendMessage(message.from, tiktok.guide);
  },
};
