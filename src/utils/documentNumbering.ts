
/**
 * Utility for generating invoice and quote numbers based on the YYYY-MM-N format
 * with sequence resetting monthly
 */

// Format: INV-YYYYMM-N or QUO-YYYYMM-N
export const generateDocumentNumber = async (
  type: 'invoice' | 'quote',
  supabase: any,
  userId: string
): Promise<string> => {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prefix = type === 'invoice' ? 'INV' : 'QUO';
  
  // Get all documents from the current month and year only
  const { data, error } = await supabase
    .from(type === 'invoice' ? 'invoices' : 'quotes')
    .select('invoice_number')
    .eq('user_id', userId)
    .like('invoice_number', `${prefix}-${yearMonth}-%`);
  
  if (error) {
    console.error(`Error fetching ${type} numbers:`, error);
    // Fallback to a timestamp-based number if there's an error
    return `${prefix}-${yearMonth}-1`;
  }
  
  // Find the highest sequence number for the current month
  let highestSequence = 0;
  
  if (data && data.length > 0) {
    data.forEach((doc: any) => {
      // Use a more strict regex to ensure we're only getting current month's sequences
      const match = doc.invoice_number.match(new RegExp(`^${prefix}-${yearMonth}-(\\d+)$`));
      if (match && match[1]) {
        const sequence = parseInt(match[1], 10);
        if (sequence > highestSequence) {
          highestSequence = sequence;
        }
      }
    });
  }
  
  // Generate the next number in sequence, starting from 1 for each month
  const nextSequence = highestSequence + 1;
  return `${prefix}-${yearMonth}-${nextSequence}`;
};

// Function to extract and parse document numbers
export const parseDocumentNumber = (number: string): { 
  prefix: string, 
  yearMonth: string, 
  sequence: number 
} | null => {
  const match = number.match(/^(INV|QUO)-(\d{6})-(\d+)$/);
  
  if (!match) return null;
  
  return {
    prefix: match[1],
    yearMonth: match[2],
    sequence: parseInt(match[3], 10)
  };
};
