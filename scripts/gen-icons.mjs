import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public/icons', { recursive: true });

const jobs = [
  ['scripts/icon.svg', 'public/icons/icon-192.png', 192],
  ['scripts/icon.svg', 'public/icons/icon-512.png', 512],
  ['scripts/icon.svg', 'public/icons/apple-touch-icon.png', 180],
  ['scripts/icon-maskable.svg', 'public/icons/maskable-192.png', 192],
  ['scripts/icon-maskable.svg', 'public/icons/maskable-512.png', 512],
];

for (const [src, out, size] of jobs) {
  await sharp(src, { density: 384 }).resize(size, size).png().toFile(out);
  console.log('wrote', out);
}
