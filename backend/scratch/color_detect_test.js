import fs from 'fs';
import { PDFDocument } from 'pdf-lib';

async function detectColor(filePath) {
  const data = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(data);
  const pages = pdfDoc.getPages();
  const colorPages = [];
  const bwPages = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let isColor = false;

    // Check Resources for ColorSpace
    // This is a heuristic. Many PDFs list ColorSpaces even if not used.
    // However, it's a good primary filter.
    const res = page.node.Resources();
    if (res) {
      const colorSpace = res.get('ColorSpace');
      if (colorSpace) {
        // If there's more than just DeviceGray, it might be color
        // In a real implementation, we'd look deeper.
        const csStr = colorSpace.toString();
        if (csStr.includes('DeviceRGB') || csStr.includes('DeviceCMYK') || csStr.includes('ICCBased')) {
          // It's a candidate for color.
          // Still could be B/W rendering in RGB.
          isColor = true; 
        }
      }
    }
    
    if (isColor) colorPages.push(i + 1);
    else bwPages.push(i + 1);
  }

  return { colorPages, bwPages };
}
