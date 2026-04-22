import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

async function testDecompress(filePath) {
  const data = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(data);
  const pages = pdfDoc.getPages();
  
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    // In pdf-lib, page.node.Contents() gives the refernece(s) to the stream
    // page.getContentStreams() is a high level way to get the streams
    const streams = page.node.Contents(); 
    console.log(`Page ${i+1} has ${Array.isArray(streams) ? streams.length : 1} streams`);
  }
}
