/// <reference lib="webworker" />

import {
  CustomFont,
  ElementStyleCalculator,
} from '../utils/pdf-utils/elements/element-styles';
import { PdfJson } from '../utils/pdf-utils/parser/element-json-types';
import { PdfParser } from '../utils/pdf-utils/parser/pdf-parser';
import {
  PdfVariableResolver,
  PipeFunction,
} from '../utils/pdf-utils/parser/pdf-variable-resolver';

interface WorkerMessage {
  functionName: string;
  args: any[];
}

interface WorkerResponse {
  functionName: string;
  result?: any;
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

function initStaticProperties(
  pipesArray: [string, string][],
  customFonts: CustomFont[]
): void {
  pipesArray.forEach(([key, funcStr]) =>
    PdfVariableResolver.registerPipe(
      key,
      new Function(`return ${funcStr}`)() as PipeFunction
    )
  );
  ElementStyleCalculator.customFonts = customFonts;
}

// Mapping of function names to implementations
const functionsMap: { [key: string]: (...args: any[]) => Promise<any> | void } =
  {
    parsePdfJson,
    // parseFromFile,
    initStaticProperties,
  };

// Event listener
addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const { functionName, args } = event.data;

  try {
    if (functionsMap[functionName]) {
      const result = await functionsMap[functionName](...args);
      const response: WorkerResponse = {
        functionName,
        result,
      };
      self.postMessage(response);
    } else {
      throw new Error(`Function ${functionName} not found`);
    }
  } catch (error: any) {
    const response: WorkerResponse = { functionName, error: error.message };
    self.postMessage(response);
  }
});
