import { CurrentCommand } from '@prisma/client';
import { Client, Message } from 'whatsapp-web.js';

import axios from '../libs/axios';
import { PREFIX } from '../constants';
import {
  checkCancelCommand,
  resetCurrentCommand,
  updateLastCommand,
} from '../libs/command';
import { toTitleCase } from '../libs/format';

const searchStudent = async (name: string) => {
  try {
    const pddiktiWebsite = 'https://pddikti.kemdikbud.go.id';
    const response = await axios.get(
      'https://api-frontend.kemdikbud.go.id/hit_mhs/' + name
    );
    const { mahasiswa } = response.data;
    if (mahasiswa.length < 2) {
      return [];
    }

    const students: {
      studentName: string;
      studentNumber: string;
      university: string;
      study: string;
      link: string;
    }[] = mahasiswa.map((item: { text: string; 'website-link': string }) => {
      let [studentName, university, study] = item.text.split(',');
      const studentNumber = studentName.split('(')[1].split(')')[0].trim();
      studentName = studentName.split('(')[0];
      university = university.trim().split(':')[1].trim();
      study = study.trim().split(':')[1].trim();

      return {
        studentName: toTitleCase(studentName),
        studentNumber,
        university: toTitleCase(university),
        study: toTitleCase(study),
        link: pddiktiWebsite + item['website-link'],
      };
    });

    return students;
  } catch (error: any) {
    console.error(error);
    return [];
  }
};

export const mahasiswa = {
  command: PREFIX + 'mahasiswa',
  guide:
    '🔎 Silahkan ketik nama mahasiswa yang ingin dicari.\nKetik *batal* jika ingin membatalkan perintah.',
  execute: async (message: Message, client: Client) => {
    client.sendMessage(message.from, mahasiswa.guide);
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

    const students = await searchStudent(message.body);
    let studentString = '';
    if (!students.length) {
      studentString += '⚠️ Mahasiswa tidak ditemukan!';
    } else {
      studentString += `📝 *Menampilkan ${students.length} hasil.*\n\n`;

      students.forEach((student) => {
        const { link, studentName, studentNumber, study, university } = student;
        studentString += `Nama : ${studentName}\n`;
        studentString += `NIM : ${studentNumber}\n`;
        studentString += `Program Studi : ${study}\n`;
        studentString += `Universitas : ${university}\n`;
        studentString += `Link PDDikti : ${link}\n\n`;
      });

      studentString += 'Sumber data: https://kemdikbud.go.id/';
    }

    await Promise.all([
      message.reply(studentString, message.from),
      updateLastCommand(userId, commandId as number),
    ]);

    await Promise.all([
      message.react('✅'),
      client.sendMessage(message.from, '✅ Selesai!'),
    ]);

    return resetCurrentCommand(userId);
  },
};
