
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, GeneratePdfOptions } from './types';
import { calculateSubtotal, calculateVat } from './calculations';

// Add the necessary typings for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * Generate a PDF for an invoice or quote
 */
export const generatePdf = async ({
  document,
  isQuote,
  logoUrl,
  businessName,
  businessAddress,
  vatNumber,
}: GeneratePdfOptions): Promise<string> => {
  try {
    console.log('Generating PDF with options:', { 
      documentId: document.id,
      documentNumber: document.invoice_number,
      isQuote,
      hasLogo: !!logoUrl,
      businessName,
    });
    
    // Check if required document data exists
    if (!document || !document.invoice_number) {
      console.error('Missing required document data for PDF generation');
      throw new Error('Invalid document data');
    }
    
    const doc = new jsPDF();
    const documentType = isQuote ? 'Quote' : 'Invoice';
    const documentNumber = document.invoice_number;
    const lineItems = document.line_items || [];
    
    // Set default coordinates
    let yPos = 20;
    const leftMargin = 15;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add logo if provided
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'JPEG', leftMargin, yPos, 40, 20);
        yPos += 25;
      } catch (error) {
        console.error('Error adding logo to PDF:', error);
        // Continue without logo if there's an error
      }
    }
    
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
    
    // Add document title and number
    yPos += 10;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${documentType} #${documentNumber}`, leftMargin, yPos);
    
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
    
    // Add client information
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', leftMargin, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(document.client_name || 'Client Name', leftMargin, yPos);
    
    // Add line items table
    yPos += 15;
    
    if (lineItems && lineItems.length > 0) {
      const tableColumn = ["Description", "Qty", "Unit", "Price", "VAT %", "Total"];
      const tableRows = lineItems.map((item: any) => [
        item.description || '',
        item.quantity || '0',
        item.unit || '',
        `$${parseFloat(item.unit_price || item.unitPrice || 0).toFixed(2)}`,
        `${(item.vat_rate || item.vatRate || 0)}%`,
        `$${((parseFloat(item.quantity || 0) * parseFloat(item.unit_price || item.unitPrice || 0)) || 0).toFixed(2)}`
      ]);
      
      try {
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: yPos,
          theme: 'grid',
          styles: { fontSize: 9 },
          headStyles: { fillColor: [66, 66, 66] },
          margin: { left: leftMargin, right: leftMargin },
        });
        
        // Update yPos to after the table
        yPos = (doc as any).lastAutoTable.finalY + 10;
      } catch (tableError) {
        console.error('Error creating table in PDF:', tableError);
        // Continue without table
        yPos += 10;
      }
    }
    
    // Add totals
    doc.setFontSize(10);
    doc.text(`Subtotal: $${calculateSubtotal(lineItems).toFixed(2)}`, pageWidth - 60, yPos);
    yPos += 6;
    doc.text(`VAT: $${calculateVat(lineItems).toFixed(2)}`, pageWidth - 60, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${document.amount || 0}`, pageWidth - 60, yPos);
    
    // Add payment terms and notes
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Terms:', leftMargin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(document.payment_terms || 'N/A', leftMargin, yPos);
    
    if (document.notes) {
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', leftMargin, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      try {
        const noteLines = doc.splitTextToSize(document.notes, 180);
        doc.text(noteLines, leftMargin, yPos);
      } catch (notesError) {
        console.error('Error adding notes to PDF:', notesError);
        // Continue without notes
      }
    }
    
    // Create data URL from the PDF
    const pdfDataUrl = doc.output('datauristring');
    console.log('PDF generation successful');
    return pdfDataUrl;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Download a generated PDF
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
