
import { jsPDF } from 'jspdf';
import { Document } from './types';
import { calculateSubtotal, calculateVat } from './calculations';

/**
 * Add the company information to the PDF
 */
export const addCompanyInfo = (
  doc: jsPDF,
  businessName?: string,
  businessAddress?: string,
  vatNumber?: string,
  yPos: number = 20
): number => {
  const leftMargin = 15;
  
  // Add business information
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName || 'Your Business', leftMargin, yPos);
  
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (businessAddress) {
    const addressLines = businessAddress.split('\n');
    addressLines.forEach(line => {
      doc.text(line, leftMargin, yPos);
      yPos += 5;
    });
  }
  
  if (vatNumber) {
    doc.text(`VAT: ${vatNumber}`, leftMargin, yPos);
    yPos += 5;
  }
  
  return yPos;
};

/**
 * Add document title and information to the PDF
 */
export const addDocumentInfo = (
  doc: jsPDF,
  document: Document,
  isQuote: boolean,
  yPos: number
): number => {
  const leftMargin = 15;
  const documentType = isQuote ? 'Quote' : 'Invoice';
  
  // Add document title and number
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${documentType} #${document.invoice_number}`, leftMargin, yPos);
  
  // Add dates
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(document.date).toLocaleDateString()}`, leftMargin, yPos);
  yPos += 5;
  
  if (document.due_date) {
    const dateLabel = isQuote ? 'Expiry Date' : 'Due Date';
    doc.text(`${dateLabel}: ${new Date(document.due_date).toLocaleDateString()}`, leftMargin, yPos);
    yPos += 5;
  }
  
  return yPos;
};

/**
 * Add client information to the PDF
 */
export const addClientInfo = (
  doc: jsPDF,
  clientName: string,
  yPos: number
): number => {
  const leftMargin = 15;
  
  // Add client information
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', leftMargin, yPos);
  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(clientName || 'Client Name', leftMargin, yPos);
  
  return yPos;
};

/**
 * Add line items table to the PDF
 */
export const addLineItemsTable = (
  doc: jsPDF,
  lineItems: any[],
  yPos: number
): number {
  if (!lineItems || !lineItems.length) {
    return yPos + 10; // If no line items, just advance a bit
  }
  
  try {
    const tableColumn = ["Description", "Qty", "Unit", "Price", "VAT %", "Total"];
    const tableRows = lineItems.map((item: any) => [
      item.description || '',
      item.quantity || '0',
      item.unit || '',
      `$${parseFloat(item.unit_price || item.unitPrice || 0).toFixed(2)}`,
      `${(item.vat_rate || item.vatRate || 0)}%`,
      `$${((parseFloat(item.quantity || 0) * parseFloat(item.unit_price || item.unitPrice || 0)) || 0).toFixed(2)}`
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 66, 66] },
      margin: { left: 15, right: 15 },
    });
    
    // Update yPos to after the table
    return (doc as any).lastAutoTable.finalY + 10;
  } catch (tableError) {
    console.error('Error creating table in PDF:', tableError);
    return yPos + 10; // Just advance a bit if there's an error
  }
};

/**
 * Add totals section to the PDF
 */
export const addTotals = (
  doc: jsPDF,
  lineItems: any[],
  totalAmount: string | number,
  yPos: number
): number => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Add totals
  doc.setFontSize(10);
  doc.text(`Subtotal: $${calculateSubtotal(lineItems).toFixed(2)}`, pageWidth - 60, yPos);
  yPos += 6;
  doc.text(`VAT: $${calculateVat(lineItems).toFixed(2)}`, pageWidth - 60, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: $${totalAmount || 0}`, pageWidth - 60, yPos);
  
  return yPos;
};

/**
 * Add notes and payment terms to the PDF
 */
export const addNotesAndTerms = (
  doc: jsPDF,
  paymentTerms?: string | null,
  notes?: string | null,
  yPos: number
): number => {
  const leftMargin = 15;
  
  // Add payment terms
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', leftMargin, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(paymentTerms || 'N/A', leftMargin, yPos);
  
  // Add notes if available
  if (notes) {
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', leftMargin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    try {
      const noteLines = doc.splitTextToSize(notes, 180);
      doc.text(noteLines, leftMargin, yPos);
      // Roughly estimate the new yPos based on number of lines
      yPos += 5 * (Array.isArray(noteLines) ? noteLines.length : 1);
    } catch (notesError) {
      console.error('Error adding notes to PDF:', notesError);
      // Continue without notes
    }
  }
  
  return yPos;
};

/**
 * Add a logo to the PDF
 */
export const addLogo = (
  doc: jsPDF,
  logoUrl?: string | null,
  yPos: number = 20
): number => {
  if (!logoUrl) return yPos;
  
  try {
    doc.addImage(logoUrl, 'JPEG', 15, yPos, 40, 20);
    return yPos + 25;
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
    return yPos; // Return original position if there's an error
  }
};
