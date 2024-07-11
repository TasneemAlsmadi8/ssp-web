/// <reference lib="webworker" />

import { PdfParser } from '../utils/pdf-utils/parser/pdf-parser';

addEventListener('message', async (event: MessageEvent) => {
  const { pdfJson } = event.data;

  try {
    const parser = new PdfParser();
    const pdfBuilder = parser.parse(pdfJson);

    // pdfBuilder.elements[1].children.forEach(
    //   (child) => (child.showBoxes = true)
    // );

    const blob = await pdfBuilder.getPdfBlob();

    self.postMessage({ blob });
  } catch (error: any) {
    self.postMessage({ error: error.message });
  }
});
