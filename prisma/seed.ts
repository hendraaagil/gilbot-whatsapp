import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const commands: Prisma.CommandCreateInput[] = [
  { name: 'menu', description: 'menampilkan daftar perintah bot' },
  { name: 'ping', description: 'ping bot' },
  {
    name: 'stiker',
    description: 'membuat stiker dari gambar / gif / video',
    requireLock: true,
    minuteLimit: 3,
  },
  {
    name: 'qr',
    description: 'membuat QR dari teks / link',
    requireLock: true,
    minuteLimit: 2,
  },
  { name: 'tentang', description: 'menampilkan informasi pembuat bot' },
];

async function main() {
  await Promise.all(
    commands.map(async (command, index) => {
      await prisma.command.upsert({
        where: { name: command.name },
        create: {
          name: command.name,
          description: command.description,
          minuteLimit: command.minuteLimit,
          requireLock: command.requireLock,
          position: index + 1,
        },
        update: {
          name: command.name,
          description: command.description,
          minuteLimit: command.minuteLimit,
          requireLock: command.requireLock,
          position: index + 1,
        },
      });
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
