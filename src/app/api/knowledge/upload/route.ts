import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseDocumentBuffer } from '@/lib/document-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customTitle = formData.get('title') as string | null;
    const sourceType = (formData.get('sourceType') as string) || 'DOCUMENT';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name;
    const fileSize = file.size;
    const mimeType = file.type;

    // Convert file to Node buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Actually parse document text
    const { text, sectionCount } = await parseDocumentBuffer(buffer, fileName, mimeType);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Unable to extract text from the provided document' },
        { status: 422 }
      );
    }

    // Save as KnowledgeSource in database
    const source = await prisma.knowledgeSource.create({
      data: {
        title: customTitle || fileName.replace(/\.[^/.]+$/, ''),
        type: sourceType,
        fileName,
        fileSize,
        mimeType,
        rawText: text,
        status: 'PENDING',
        confidence: 0.9,
      },
    });

    // Create chunks for large documents
    const chunkSize = 2000;
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push({
        sourceId: source.id,
        content: text.slice(i, i + chunkSize),
        chunkIndex: Math.floor(i / chunkSize),
      });
    }

    if (chunks.length > 0) {
      await prisma.knowledgeChunk.createMany({ data: chunks });
    }

    return NextResponse.json({
      success: true,
      sourceId: source.id,
      title: source.title,
      fileName,
      fileSize,
      sectionCount,
      extractedText: text,
    });
  } catch (error) {
    console.error('Document upload parsing error:', error);
    return NextResponse.json({ error: 'Could not process this document' }, { status: 500 });
  }
}
