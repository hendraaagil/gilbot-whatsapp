import { Prisma } from '@prisma/client';

export const credits: Prisma.CreditCreateInput[] = [
  { name: 'BMKG', link: 'https://data.bmkg.go.id/' },
  { name: 'TiklyDown API', link: 'https://api.tiklydown.me/' },
  { name: 'The Cat API', link: 'https://thecatapi.com/' },
  { name: 'Candaan API', link: 'https://candaan-api.vercel.app/' },
  { name: 'SnapSave', link: 'https://snapsave.app/download-video-instagram' },
  { name: 'waifu.pics', link: 'https://waifu.pics/' },
  {
    name: 'jadwalsholatorg',
    link: 'https://github.com/lakuapik/jadwalsholatorg',
  },
  { name: 'summarize.tech', link: 'https://www.summarize.tech/' },
  {
    name: 'api-frontend.kemdikbud',
    link: 'https://api-frontend.kemdikbud.go.id/hit_mhs/%7Bnama_mahasiswa%7D',
  },
];
