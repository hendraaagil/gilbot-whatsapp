import { CurrentCommand } from '@prisma/client';
import {
  Client,
  Message,
  MessageMedia,
  MessageSendOptions,
} from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';
import threadsApi from '../libs/threads';
import { ThreadsMedia } from '../types/threads';

const downloadMedia = async (
  message: string
): Promise<{
  isSuccess: boolean;
  message: string;
  data?: { username: string; caption?: string; media: ThreadsMedia[] };
}> => {
  try {
    const postId = threadsApi.getPostIDfromURL(message);

    if (postId) {
      const post = await threadsApi.getThreads(postId);
      const thread = post.containing_thread.thread_items[0].post;
      // console.dir(thread, { depth: null });

      const media: ThreadsMedia[] = [];
      if (!thread.carousel_media) {
        if (
          thread.image_versions2 &&
          thread.image_versions2.candidates.length &&
          !thread.video_versions.length
        ) {
          media.push({
            type: 'image',
            name: thread.code,
            url: thread.image_versions2.candidates[0].url,
          });
        } else if (thread.video_versions.length) {
          media.push({
            type: 'video',
            name: thread.code,
            url: thread.video_versions[0].url,
          });
        }
      } else {
        thread.carousel_media.forEach(
          (
            item: {
              image_versions2: { candidates: { url: string }[] };
              video_versions: { type: number; url: string }[];
            },
            index: number
          ) => {
            if (item.image_versions2 && !item.video_versions.length) {
              media.push({
                type: 'image',
                name: thread.code + '_' + index,
                url: item.image_versions2.candidates[0].url,
              });
            } else if (item.video_versions.length) {
              media.push({
                type: 'video',
                name: thread.code + '_' + index,
                url: item.video_versions[0].url,
              });
            }
          }
        );
      }

      const data = {
        username: thread.user.username,
        caption: thread.caption?.text,
        media: media,
      };
      // console.log('DATA >>', data);

      return { isSuccess: true, message: '✅ Selesai!', data: data };
    }

    return {
      isSuccess: false,
      message: '⚠️ Media tidak ditemukan / link tidak valid!',
    };
  } catch (error) {
    console.error(error);
    return {
      isSuccess: false,
      message: '⚠️ Terdapat kesalahan saat mendownload media.',
    };
  }
};

export const threads = {
  command: PREFIX + 'threads',
  guide:
    '🔎 Silahkan kirim link Threads yang ingin didownload.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, threads.guide);
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

    if (result.isSuccess && result.data) {
      const caption = `📌 *${result.data?.username}*\n---\n${
        result.data?.caption || 'No Caption'
      }`;
      await message.reply(caption, message.from);

      for (let i = 0; i < result.data?.media.length; i++) {
        const item = result.data?.media[i];

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

        await client.sendMessage(message.from, messageContent, messageOptions);
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
    return client.sendMessage(message.from, threads.guide);
  },
};
