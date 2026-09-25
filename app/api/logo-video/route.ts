import { readFile } from 'node:fs/promises';

export async function GET() {
  const video = await readFile('D:\\ShmilApps\\Site\\Logos\\LogoClip_10sec.mp4');
  return new Response(video, { headers: { 'Content-Type': 'video/mp4', 'Cache-Control': 'public, max-age=3600' } });
}
