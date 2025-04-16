
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document } from './types';

// Add the necessary typings for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Creates a new PDF document instance
 */
export const createPdfDocument = (): jsPDF => {
  return new jsPDF();
};

/**
 * Create a data URL from a PDF document
 */
export const createPdfDataUrl = (doc: jsPDF): string => {
  try {
    return doc.output('datauristring');
  } catch (error) {
    console.error('Error creating PDF data URL:', error);
    throw new Error('Failed to create PDF data URL');
  }
};

/**
 * Download a PDF from a data URL
 */
export const downloadPdf = (dataUrl: string, fileName: string) => {
  try {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
};
