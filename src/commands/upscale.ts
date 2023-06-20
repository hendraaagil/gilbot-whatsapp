import fs from 'fs';
import waifu2x from 'waifu2x';
import { join } from 'path';
import { CurrentCommand } from '@prisma/client';
import { Client, Message, MessageMedia } from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';
import { checkSupportedImageExtension, getImageExtension } from '../libs/image';

export const upscale = {
  command: PREFIX + 'upscale',
  guide:
    '🔎 Silahkan kirim gambar png / jpg yang ingin ditingkatkan resolusinya\n_Tips: kirim gambar sebagai dokumen agar tidak dikompres oleh WhatsApp_.\n\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, upscale.guide);
  },
  generate: async (args: {
    currentCommand: CurrentCommand;
    message: Message;
    client: Client;
  }) => {
    try {
      const {
        currentCommand: { commandId, userId },
        message,
        client,
      } = args;

      const isCancelled = await checkCancelCommand(userId, message, client);
      if (isCancelled) return;

      if (message.hasMedia) {
        const [senderMedia] = await Promise.all([
          message.downloadMedia(),
          message.react('⏳'),
        ]);

        const isSupported = checkSupportedImageExtension(senderMedia.mimetype);
        if (!isSupported) {
          await Promise.all([
            message.react('❌'),
            message.reply(`⚠️ Ekstensi file tidak didukung!`, message.from),
          ]);
          return client.sendMessage(message.from, upscale.guide);
        }

        const imgExtension = getImageExtension(senderMedia.mimetype);
        const filename =
          senderMedia.filename || userId + '_' + Date.now() + imgExtension;
        const sourcePath = join(__dirname, '..', '..', 'waifu2x', filename);
        const destPath = join(
          __dirname,
          '..',
          '..',
          'waifu2x',
          '2x_' + filename
        );

        waifu2x.chmod777(
          join(__dirname, '..', '..', 'node_modules/waifu2x/waifu2x'),
          join(__dirname, '..', '..', 'node_modules/waifu2x/webp'),
          join(__dirname, '..', '..', 'node_modules/waifu2x/real-esrgan')
        );
        fs.writeFileSync(sourcePath, senderMedia.data, 'base64');
        await waifu2x.upscaleImage(sourcePath, destPath, {
          upscaler: 'real-esrgan',
          scale: 2,
        });

        const upscaledMedia = MessageMedia.fromFilePath(destPath);
        await message.reply(upscaledMedia, message.from, {
          sendMediaAsDocument: true,
        });

        await Promise.all([
          message.react('✅'),
          client.sendMessage(message.from, '✅ Selesai!'),
          updateLastCommand(userId, commandId as number),
        ]);

        fs.unlinkSync(sourcePath);
        fs.unlinkSync(destPath);
        return resetCurrentCommand(userId);
      }

      return client.sendMessage(message.from, upscale.guide);
    } catch (err) {
      console.error(err);
    }
  },
};
