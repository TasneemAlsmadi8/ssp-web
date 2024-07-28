import { Injectable } from '@angular/core';
import {
  DataRecord,
  MultiDataRecords,
  PdfJson,
} from '../utils/pdf-utils/parser/element-json-types';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { PdfVariableResolver } from '../utils/pdf-utils/parser/pdf-variable-resolver';
import { ElementStyleCalculator } from '../utils/pdf-utils/elements/element-styles';

@Injectable({
  providedIn: 'root',
})
export class PdfWorkerService {
  private worker: Worker;

  constructor(private http: HttpClient) {
    // const url = 'src/app/shared/workers/pdf-worker.worker';
    // for some reason the URL object cannot be put in a constant
    // I suspect that it's related to Angular Tree shaking
    this.worker = new Worker(
      new URL('src/app/shared/workers/pdf-worker.worker', import.meta.url)
    );
  }

  private initStaticProperties() {
    // Transfer static properties
    const pipesArray = Array.from(PdfVariableResolver.pipes.entries()).map(
      ([key, func]) => [key, func.toString()]
    );
    this.worker.postMessage({
      functionName: 'initStaticProperties',
      args: [pipesArray, ElementStyleCalculator.customFonts],
    });
  }

  async download(
    pdfJson: PdfJson,
    data: MultiDataRecords | DataRecord[],
    input?: DataRecord,
    additionalVariables?: DataRecord
  ): Promise<void> {
    pdfJson.data = data;
    pdfJson.input = input;
    pdfJson.variables = { ...pdfJson.variables, ...additionalVariables };
    return new Promise((resolve, reject) => {
      this.initStaticProperties();
      this.worker.postMessage({
        functionName: 'parsePdfJson',
        args: [pdfJson],
      });

      this.worker.onmessage = (event) => {
        const { functionName, result, error } = event.data;
        if (functionName !== 'parsePdfJson') return;
        const { fileName, blob } = result;

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

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        reject(new Error(`Worker error: ${error}`));
      };
    });
  }

  async downloadFromFile(
    jsonFileName: string,
    data: MultiDataRecords | DataRecord[],
    input?: DataRecord,
    additionalVariables?: DataRecord
  ): Promise<void> {
    const pdfJson = await lastValueFrom(this.http.get<PdfJson>(jsonFileName));
    return this.download(pdfJson, data, input, additionalVariables);
  }
}
