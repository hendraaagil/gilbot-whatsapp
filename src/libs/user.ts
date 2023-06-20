import prisma from './prisma';

export const checkBanUser = async (userId: number) => {
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
