import fs from 'fs';
import { Message } from 'whatsapp-web.js';

const createJsonLog = (name: string, number: string) => {
  const folderPath = './users';
  const filePath = folderPath + '/' + number + '.json';

  const isUsersFolderExist = fs.existsSync(folderPath);
  if (!isUsersFolderExist) {
    fs.mkdirSync(folderPath);
  }

  const isUserFileExist = fs.existsSync(filePath);
  if (isUserFileExist) {
    const userFile = fs.readFileSync(filePath, 'utf-8');
    let userJson = JSON.parse(userFile);
    userJson.lastSent = new Date();

    fs.writeFileSync(filePath, JSON.stringify(userJson), 'utf-8');
  } else {
    const userData = {
      name: name,
      number: number,
      lastSent: new Date(),
    };

    fs.writeFile(filePath, JSON.stringify(userData), 'utf-8', (err) => {
      if (err) {
        throw err;
      }
      console.log(filePath, '>> Created!');
    });
  }
};

export const logAction = async (message: Message) => {
  const { pushname: name, number } = await message.getContact();
  createJsonLog(name, number);

  console.log({
    sender: name,
    number: number,
    message: message.body,
    deviceType: message.deviceType,
    hasMedia: message.hasMedia,
  });
};
