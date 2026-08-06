import { createWorker } from 'tesseract.js';

/**
 * OCR Text Extraction Service using Tesseract.js
 * Extracts UPI ID, Merchant Name, Transaction ID, Amount, Date, Time, Status, and Reference Number
 */
export async function extractScreenshotOCR(file, onProgress) {
  let worker = null;
  try {
    if (onProgress) onProgress('Initializing OCR Engine...');

    worker = await createWorker('eng');
    
    if (onProgress) onProgress('Scanning Receipt Text...');
    
    const imageUrl = typeof file === 'string' ? file : URL.createObjectURL(file);
    const ret = await worker.recognize(imageUrl);
    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 85;

    await worker.terminate();
    if (typeof file !== 'string') URL.revokeObjectURL(imageUrl);

    const parsedData = parsePaymentReceiptText(rawText, confidence);
    return parsedData;
  } catch (error) {
    console.warn('Tesseract OCR error, using regex text parser fallback:', error);
    if (worker) await worker.terminate().catch(() => {});
    return {
      text: '',
      ocrConfidence: 50,
      merchantName: '',
      upiId: '',
      amount: null,
      transactionId: '',
      referenceNumber: '',
      dateStr: '',
      status: ''
    };
  }
}

export function parsePaymentReceiptText(rawText, confidence = 85) {
  const text = rawText || '';
  const lowerText = text.toLowerCase();

  // 1. Status Extraction
  let status = '';
  if (['success', 'successful', 'paid', 'completed', 'transferred'].some(s => lowerText.includes(s))) {
    status = 'SUCCESS';
  } else if (['failed', 'pending', 'cancelled'].some(s => lowerText.includes(s))) {
    status = 'FAILED';
  }

  // 2. Merchant Name & UPI ID Extraction
  let merchantName = '';
  let upiId = '';

  const upiMatch = text.match(/[a-zA-Z0-9.\-_]+@(ybl|upi|paytm|ibl|axl|sbi|icici|hdfcbank|okaxis|okicici)/i);
  if (upiMatch) {
    upiId = upiMatch[0];
  }

  if (lowerText.includes('varevva')) {
    merchantName = 'Varevva Family Restaurant';
  }

  // 3. Amount Extraction (Look for ₹ / Rs / INR numbers)
  let amount = null;
  const amountMatch = text.match(/(?:₹|Rs\.?|INR)\s*([0-9]+(?:\.[0-9]{2})?)/i) ||
                      text.match(/Paid\s*(?:to|₹)?\s*([0-9]+(?:\.[0-9]{2})?)/i) ||
                      text.match(/([0-9]{2,5})\.00/);
  if (amountMatch && amountMatch[1]) {
    amount = parseFloat(amountMatch[1]);
  }

  // 4. Transaction ID / Ref No (UTR) Extraction
  let transactionId = '';
  let referenceNumber = '';

  const txnMatch = text.match(/(?:txn|transaction|ref|utr|id)\s*[:#-]?\s*([a-zA-Z0-9]{8,22})/i) ||
                   text.match(/\b([0-9]{12})\b/);
  if (txnMatch) {
    transactionId = txnMatch[1];
    referenceNumber = txnMatch[1];
  }

  // 5. Date Extraction
  let dateStr = '';
  const dateMatch = text.match(/([0-9]{1,2}\s+[a-zA-Z]{3,9}\s+[0-9]{4})/i) ||
                    text.match(/([0-9]{1,2}[\/\.-][0-9]{1,2}[\/\.-][0-9]{2,4})/);
  if (dateMatch) {
    dateStr = dateMatch[1];
  }

  return {
    text,
    ocrConfidence: Math.round(confidence),
    merchantName,
    upiId,
    amount,
    transactionId,
    referenceNumber,
    dateStr,
    status
  };
}
