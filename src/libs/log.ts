import { PrismaClient } from '@prisma/client';
import { Message } from 'whatsapp-web.js';

export const logMessage = async (message: Message, prisma: PrismaClient) => {
  const { pushname: name, number } = await message.getContact();

  let user = await prisma.user.findUnique({
    where: { number: number },
    select: { id: true, number: true, name: true },
  });
  if (!user) {
    user = await prisma.user.create({
      data: { number: number, chatId: message.from, name: name },
      select: { id: true, number: true, name: true },
    });
  } else if (user.name !== name) {
    await prisma.user.update({
      where: { number: number },
      data: { name: name },
    });
  }

  return prisma.logMessage.create({
    data: {
      userId: user.id,
      deviceType: message.deviceType,
      hasMedia: message.hasMedia,
      message: message.body,
    },
  });
};
