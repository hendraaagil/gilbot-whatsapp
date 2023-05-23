import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const commands: Prisma.CommandCreateInput[] = [
  { name: 'menu', description: 'menampilkan daftar perintah bot' },
  { name: 'ping', description: 'ping bot' },
  {
    name: 'sholat',
    description: 'cari jadwal sholat berdasarkan lokasi',
    requireLock: true,
  },
  { name: 'kucing', description: 'minta gambar kucing' },
  { name: 'receh', description: 'minta receh bang', minuteLimit: 1 },
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
  {
    name: 'rangkum',
    description: 'merangkum video YouTube ke dalam teks bahasa inggris',
    requireLock: true,
    minuteLimit: 15,
  },
  {
    name: 'mahasiswa',
    description: 'cari data mahasiswa berdasarkan nama',
    requireLock: true,
    minuteLimit: 2,
  },
  { name: 'tentang', description: 'menampilkan informasi pembuat bot' },
];

async function main() {
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
