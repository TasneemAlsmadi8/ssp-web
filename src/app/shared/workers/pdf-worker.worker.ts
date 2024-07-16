/// <reference lib="webworker" />

import { PdfParser } from '../utils/pdf-utils/parser/pdf-parser';

addEventListener('message', async (event: MessageEvent) => {
  const { pdfJson, data, input } = event.data;

  try {
    const parser = new PdfParser();
    const pdfBuilder = parser.parse(pdfJson, data, input);

    // pdfBuilder.elements[1].children.forEach(
    //   (child) => (child.showBoxes = true)
    // );

    const blob = await pdfBuilder.getPdfBlob();

    self.postMessage({ blob });
  } catch (error: any) {
    self.postMessage({ error: error.message });
  }
});
