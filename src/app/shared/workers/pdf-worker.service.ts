import { Injectable } from '@angular/core';
import { PdfJson } from '../utils/pdf-utils/parser/element-json-types';

@Injectable({
  providedIn: 'root',
})
export class PdfWorkerService {
  private worker: Worker;

  constructor() {
    // const url = 'src/app/shared/workers/pdf-worker.worker';
    // for some reason the URL object cannot be put in a constant
    // I suspect that it's related to Angular Tree shaking
    this.worker = new Worker(
      new URL('src/app/shared/workers/pdf-worker.worker', import.meta.url)
    );
  }
  async download(pdfJson: PdfJson): Promise<void> {
    const { fileName } = pdfJson;

    return new Promise((resolve, reject) => {
      this.worker.postMessage({ pdfJson });

      this.worker.onmessage = (event: MessageEvent) => {
        const { blob, error } = event.data;

        if (error) {
          console.error('Error generating PDF:', error);
          reject(new Error(`Error generating PDF: ${error}`));
          return;
        }

        // Download the PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        resolve();
      };

      this.worker.onerror = function (error) {
        console.error('Worker error:', this, error);
        reject(new Error(`Worker error: ${error}`));
      };
    });
  }
  // webpack:///src/app/shared/utils/pdf-utils/parse-pdf-in-worker.ts
}
