import { differenceInMinutes } from 'date-fns';
import { Chat, Client, MessageTypes } from 'whatsapp-web.js';

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
      diffMinutes > 10 &&
      ![
        MessageTypes.REACTION,
        MessageTypes.BROADCAST_NOTIFICATION,
        MessageTypes.E2E_NOTIFICATION,
      ].includes(lastMessage.type)
    ) {
      unreplyChats.push(chat);
    }
  });
  console.info('unreplyChats[]', unreplyChats);

  unreplyChats.map((chat) => {
    commands.halo.execute(chat.lastMessage, client);
  });
};
