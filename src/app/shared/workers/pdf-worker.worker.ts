/// <reference lib="webworker" />

import { PdfJson } from '../utils/pdf-utils/parser/element-json-types';
import { PdfParser } from '../utils/pdf-utils/parser/pdf-parser';

interface WorkerMessage {
  functionName: string;
  args: any[];
}

interface WorkerResponse {
  fileName?: string;
  blob?: Blob;
  error?: string;
}

// Function implementations
async function parsePdfJson(
  pdfJson: PdfJson
): Promise<{ fileName: string; blob: Blob }> {
  const parser = new PdfParser();
  const pdfBuilder = await parser.parse(pdfJson);
  const blob = await pdfBuilder.getPdfBlob();
  return {
    fileName: pdfBuilder.fileName,
    blob,
  };
}

// Mapping of function names to implementations
const functionsMap: { [key: string]: (...args: any[]) => Promise<any> } = {
  parsePdfJson,
  // parseFromFile,
};

// Event listener
addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { functionName, args } = event.data;

  try {
    if (functionsMap[functionName]) {
      const result = await functionsMap[functionName](...args);
      const response: WorkerResponse = {
        fileName: result['fileName'],
        blob: result['blob'],
      };
      self.postMessage(response);
    } else {
      throw new Error(`Function ${functionName} not found`);
    }
  } catch (error: any) {
    const response: WorkerResponse = { error: error.message };
    self.postMessage(response);
  }
});
