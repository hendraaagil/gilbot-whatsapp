import { CurrentCommand } from '@prisma/client';
import { Client, Message, MessageMedia } from 'whatsapp-web.js';

import axios from '../libs/axios';
import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';
import type { ApiTiklyDownResponse } from '../types/tiktok';

enum MediaType {
  Image = 'image',
  Video = 'video',
}

const downloadVideo = async (
  link: string
): Promise<{
  isSuccess: boolean;
  message: string;
  data?: {
    authorId: string;
    id: number;
    title: string;
    type: MediaType;
    video: string;
    images: string[];
  };
}> => {
  try {
    const response = await axios.get<ApiTiklyDownResponse>(
      'https://api.tiklydown.me/api/download?url=' + link
    );
    const data = {
      authorId: response.data.author.unique_id,
      id: response.data.id,
      title: response.data.title,
      type: response.data.video ? MediaType.Video : MediaType.Image,
      video: response.data.video ? response.data.video.noWatermark : '',
      images: response.data.images
        ? response.data.images.map((image) => image.url)
        : [],
    };

    return {
      isSuccess: true,
      message: '✅ Selesai!',
      data: data,
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
      const { data } = result;
      if (data?.type === MediaType.Video && data.video) {
        const title = data.id + '_' + (data.authorId as string);
        const videoMedia = await MessageMedia.fromUrl(data.video as string, {
          filename: title + '.mp4',
          unsafeMime: true,
        });

        await message.reply(title, message.from, {
          sendMediaAsDocument: true,
          caption: title,
          media: videoMedia,
        });
      } else if (data?.images) {
        for (let i = 0; i < data.images.length; i++) {
          const image = data.images[i];
          const media = await MessageMedia.fromUrl(image, { unsafeMime: true });

          if (i < 1) {
            await message.reply(media, message.from);
          } else {
            await client.sendMessage(message.from, media);
          }
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
    return client.sendMessage(message.from, tiktok.guide);
  },
};
