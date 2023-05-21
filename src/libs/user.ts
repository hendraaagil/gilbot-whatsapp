import { PrismaClient } from '@prisma/client';

export const checkBanUser = async (userId: number, prisma: PrismaClient) => {
  let isBanned = false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isBanned: true },
  });
  if (user && user.isBanned) {
    isBanned = true;
  }

  return isBanned;
};
