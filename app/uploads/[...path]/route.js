import { promises as fs } from 'fs';
import path from 'path';
import { PLACEHOLDER_SVG } from '../../../utils/imageHelper.js';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const filename = pathSegments.join('/');

    if (!filename) {
      return new Response('File not found', { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const ext = path.extname(filename).toLowerCase();

      let contentType = 'image/jpeg';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.webp') contentType = 'image/webp';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.svg') contentType = 'image/svg+xml';
      else if (ext === '.mp4') contentType = 'video/mp4';

      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      // If file doesn't exist on disk, return placeholder SVG
      const svgBuffer = Buffer.from(decodeURIComponent(PLACEHOLDER_SVG.replace('data:image/svg+xml,', '')));
      return new Response(svgBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache',
        },
      });
    }
  } catch (err) {
    return new Response(err.message || 'Internal Server Error', { status: 500 });
  }
}
