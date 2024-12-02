import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const format = formData.get('format') as string;
    const width = formData.get('width') ? parseInt(formData.get('width') as string) : undefined;
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : undefined;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    let outputBuffer: Buffer;

    if (format.toLowerCase() === 'ico') {
      // Convert to ICO using sharp for initial processing
      let sharpImage = sharp(buffer);
      
      // Resize if dimensions are provided
      if (width && height) {
        sharpImage = sharpImage.resize(width, height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        });
      }
      
      // Convert to PNG first
      const pngBuffer = await sharpImage.png().toBuffer();
      // Then convert PNG to ICO
      outputBuffer = await pngToIco(pngBuffer);
    } else if (format.toLowerCase() === 'icns') {
      // For ICNS, we'll create a high-quality PNG that can be used as an icon
      let sharpImage = sharp(buffer);
      
      // Resize if dimensions are provided, otherwise use standard Mac icon size
      const targetSize = width || 1024;
      sharpImage = sharpImage.resize(targetSize, targetSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
      
      outputBuffer = await sharpImage.png().toBuffer();
    } else {
      // Handle other formats using sharp
      let sharpImage = sharp(buffer);

      if (width || height) {
        sharpImage = sharpImage.resize(width, height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        });
      }

      switch (format.toLowerCase()) {
        case 'png':
          outputBuffer = await sharpImage.png().toBuffer();
          break;
        case 'jpg':
        case 'jpeg':
          outputBuffer = await sharpImage.jpeg().toBuffer();
          break;
        case 'webp':
          outputBuffer = await sharpImage.webp().toBuffer();
          break;
        default:
          return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
      }
    }

    // Set appropriate content type and filename
    const contentType = format.toLowerCase() === 'jpg' ? 'jpeg' : format.toLowerCase();
    const extension = format.toLowerCase() === 'jpg' ? 'jpg' : format.toLowerCase();

    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': `image/${contentType}`,
        'Content-Disposition': `attachment; filename="converted.${extension}"`,
      },
    });
  } catch (error) {
    console.error('Error converting image:', error);
    return NextResponse.json({ error: 'Error converting image' }, { status: 500 });
  }
} 