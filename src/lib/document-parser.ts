export async function parseDocumentBuffer(
  buffer: Buffer,
  fileName: string,
  mimeType?: string
): Promise<{ text: string; sectionCount: number }> {
  const ext = fileName.toLowerCase().split('.').pop() || '';

  // 1. Text, Markdown, CSV, JSON
  if (['txt', 'md', 'markdown', 'csv', 'json', 'yaml', 'yml'].includes(ext)) {
    const text = buffer.toString('utf-8');
    const sections = text.split(/\n\s*#{1,3}\s+|\n\s*---\s*\n|\n\n+/).filter(Boolean);
    return {
      text,
      sectionCount: Math.max(1, sections.length),
    };
  }

  // 2. DOCX Word Documents via mammoth
  if (ext === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value || '';
      const sections = text.split(/\n\s*\n+/).filter(Boolean);
      return {
        text,
        sectionCount: Math.max(1, sections.length),
      };
    } catch (err) {
      console.warn('DOCX parse failed, falling back to string extract:', err);
      const text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      return { text, sectionCount: 1 };
    }
  }

  // 3. PDF Files via pdf-parse
  if (ext === 'pdf') {
    try {
      // @ts-ignore
      const pdfModule = await import('pdf-parse');
      const pdfParse = (pdfModule as any).default || pdfModule;
      const data = await (pdfParse as any)(buffer);
      const text = data.text || '';
      const sections = text.split(/\n\s*\n\s*\n+/).filter(Boolean);
      return {
        text,
        sectionCount: Math.max(1, sections.length),
      };
    } catch (err) {
      console.warn('PDF parse failed or binary unparseable, using sanitized buffer extraction:', err);
      const text = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      return { text: text.slice(0, 10000), sectionCount: 1 };
    }
  }

  // Default fallback for any generic text-based format
  const rawText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  return {
    text: rawText,
    sectionCount: 1,
  };
}
