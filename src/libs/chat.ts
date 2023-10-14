import { differenceInMinutes } from 'date-fns';
import { Chat, Client } from 'whatsapp-web.js';

import { commands } from '../commands';

export const checkUnreplyChats = async (client: Client) => {
  const chats = await client.getChats();
  const unreplyChats: Chat[] = [];

  chats.map((chat) => {
    const lastMessage = chat.lastMessage;
    const diffMinutes = differenceInMinutes(
      new Date(),
      new Date(lastMessage.timestamp * 1000)
    );

    if (
      lastMessage.from !== '0@c.us' &&
      !lastMessage.fromMe &&
      diffMinutes > 10
    ) {
      unreplyChats.push(chat);
    }
  });
  console.info('unreplyChats[]', unreplyChats);

  unreplyChats.map((chat) => {
    commands.halo.execute(chat.lastMessage, client);
  });
};
