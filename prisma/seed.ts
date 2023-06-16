import { PrismaClient } from '@prisma/client';
import { commands } from './data/commands';
import { credits } from './data/credits';

const prisma = new PrismaClient();

async function main() {
  // Commands
  await Promise.all(
    commands.map(async (command, index) => {
      const isExist = await prisma.command.findUnique({
        where: { name: command.name },
      });

      if (isExist) {
        await prisma.command.update({
          where: { name: command.name },
          data: {
            description: command.description,
            minuteLimit: command.minuteLimit,
            requireLock: command.requireLock,
            position: index + 1,
          },
        });
      } else {
        await prisma.command.create({
          data: {
            name: command.name,
            description: command.description,
            minuteLimit: command.minuteLimit,
            requireLock: command.requireLock,
            position: index + 1,
          },
        });
      }
    })
  );

  // Credits
  await Promise.all(
    credits.map(async (credit, index) => {
      const isExist = await prisma.credit.findUnique({
        where: { link: credit.link },
      });

      if (isExist) {
        await prisma.credit.update({
          where: { link: credit.link },
          data: {
            name: credit.name,
            position: index + 1,
          },
        });
      } else {
        await prisma.credit.create({
          data: {
            name: credit.name,
            link: credit.link,
            position: index + 1,
          },
        });
      }
    })
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
