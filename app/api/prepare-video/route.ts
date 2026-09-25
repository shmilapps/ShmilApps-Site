import { copyFileSync } from 'node:fs';

export async function GET() {
  copyFileSync(
    'D:\\ShmilApps\\Site\\Logos\\LogoClip_10sec.mp4',
    'D:\\ShmilApps\\Site\\website\\public\\brand\\LogoClip_10sec.mp4',
  );
  return Response.json({ ready: true });
}
