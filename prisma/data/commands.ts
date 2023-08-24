import { Prisma } from '@prisma/client';

export const commands: Prisma.CommandCreateInput[] = [
  { name: 'menu', description: 'menampilkan daftar perintah bot' },
  { name: 'ping', description: 'ping bot' },
  { name: 'gempa', description: 'informasi gempa terbaru' },
  { name: 'kucing', description: 'minta gambar kucing' },
  { name: 'quote', description: 'minta quote bang' },
  { name: 'waifu', description: 'minta waifu bang' },
  { name: 'receh', description: 'minta receh bang', minuteLimit: 1 },
  {
    name: 'sholat',
    description: 'cari jadwal sholat berdasarkan lokasi',
    requireLock: true,
  },
  {
    name: 'hitung',
    description: 'menghitung operasi matematika sederhana',
    requireLock: true,
  },
  {
    name: 'stiker',
    description: 'membuat stiker dari gambar / gif / video',
    requireLock: true,
    minuteLimit: 2,
  },
  {
    name: 'qr',
    description: 'membuat QR dari teks / link',
    requireLock: true,
    minuteLimit: 2,
  },
  {
    name: 'insta',
    description: 'download reel / post Instagram',
    requireLock: true,
    minuteLimit: 10,
  },
  {
    name: 'threads',
    description: 'download gambar / video Threads',
    requireLock: true,
    minuteLimit: 10,
  },
  {
    name: 'tiktok',
    description: 'download video TikTok tanpa watermark',
    requireLock: true,
    minuteLimit: 10,
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
  {
    name: 'bagikan',
    description: 'berikan link bot ini kepada yang membutuhkan',
  },
  { name: 'tentang', description: 'menampilkan informasi pembuat bot' },
];
