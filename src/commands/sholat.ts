import axios from 'axios';
import { CurrentCommand, PrismaClient } from '@prisma/client';
import { format, formatISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Client, Message } from 'whatsapp-web.js';

import { PREFIX } from '../constants';
import { resetCurrentCommand, updateLastCommand } from '../libs/command';
import { toTitleCase } from '../libs/format';
import { menu } from './menu';

type Schedule = {
  tanggal: string;
  imsyak: string;
  shubuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashr: string;
  magrib: string;
  isya: string;
};

const getSchedule = async (locationInput: string) => {
  try {
    const year = new Date().getFullYear();
    const month = format(new Date(), 'MM');
    const currentDate = formatISO(new Date(), { representation: 'date' });
    const location = locationInput.toLowerCase();

    const response = await axios.get(
      `https://raw.githubusercontent.com/lakuapik/jadwalsholatorg/master/adzan/${location}/${year}/${month}.json`
    );
    console.log('Location:', location);
    console.log(response.statusText, response.status);
    const schedule: Schedule = response.data.find(
      (data: Schedule) => data.tanggal === currentDate
    );
    const { shubuh, terbit, dzuhur, ashr, magrib, isya } = schedule;

    let scheduleString = `🕜 *Jadwal Sholat Daerah ${toTitleCase(
      location
    )}*\n\n`;
    scheduleString += `*Hari, Tanggal :* ${format(
      new Date(currentDate),
      'PPPP',
      {
        locale: id,
      }
    )}\n`;
    scheduleString += `Subuh, ${shubuh}\n`;
    scheduleString += `Terbit, ${terbit}\n`;
    scheduleString += `Dzuhur, ${dzuhur}\n`;
    scheduleString += `Ashar, ${ashr}\n`;
    scheduleString += `Maghrib, ${magrib}\n`;
    scheduleString += `Isya, ${isya}\n\n`;
    scheduleString +=
      'Sumber data : https://github.com/lakuapik/jadwalsholatorg';

    return scheduleString;
  } catch (error: any) {
    console.log('Location:', locationInput);
    console.error(error?.response?.data);
    if (error?.response?.status === 404) {
      return `⚠ Jadwal lokasi *${locationInput}* tidak ditemukan!`;
    }
    return `⚠ Mohon maaf, terdapat kesalahan pengambilan data.`;
  }
};

export const sholat = {
  command: PREFIX + 'sholat',
  guide:
    '🔎 Silahkan ketik lokasi yang ingin dicari.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, sholat.guide);
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
    const schedule = await getSchedule(message.body);
    await Promise.all([
      message.reply(schedule, message.from),
      message.react('✅'),
      updateLastCommand(userId, commandId as number, prisma),
    ]);
    return resetCurrentCommand(userId, prisma);
  },
};
