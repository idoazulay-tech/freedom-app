/**
 * Document Processing Module
 * Handles document upload, OCR, extraction, and AI analysis
 */

export interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  fileSize: number;
  extractedText: string;
  documentType: 'debt_notice' | 'warning_letter' | 'enforcement_notice' | 'bank_statement' | 'payslip' | 'other';
  extractedData: {
    creditorName?: string;
    debtAmount?: number;
    dueDate?: Date;
    accountNumber?: string;
    caseNumber?: string;
    extractedFields: Record<string, any>;
  };
  aiSummary: string;
  keyPoints: string[];
  riskFactors: string[];
  recommendedActions: string[];
}

/**
 * Detect document type from filename and content
 */
export function detectDocumentType(
  fileName: string,
  extractedText: string
): ProcessedDocument['documentType'] {
  const lowerFileName = fileName.toLowerCase();
  const lowerText = extractedText.toLowerCase();

  // Check filename first
  if (lowerFileName.includes('הודעה') || lowerFileName.includes('notice')) return 'debt_notice';
  if (lowerFileName.includes('התראה') || lowerFileName.includes('warning')) return 'warning_letter';
  if (lowerFileName.includes('הוצל"פ') || lowerFileName.includes('enforcement')) return 'enforcement_notice';
  if (lowerFileName.includes('בנק') || lowerFileName.includes('bank')) return 'bank_statement';
  if (lowerFileName.includes('משכורת') || lowerFileName.includes('payslip')) return 'payslip';

  // Check content
  if (
    lowerText.includes('הודעה על חוב') ||
    lowerText.includes('debt notice') ||
    lowerText.includes('חוב בגין')
  )
    return 'debt_notice';
  if (
    lowerText.includes('התראה') ||
    lowerText.includes('warning') ||
    lowerText.includes('אזהרה')
  )
    return 'warning_letter';
  if (
    lowerText.includes('הוצל"פ') ||
    lowerText.includes('enforcement') ||
    lowerText.includes('בית משפט')
  )
    return 'enforcement_notice';
  if (lowerText.includes('בנק') || lowerText.includes('bank') || lowerText.includes('חשבון'))
    return 'bank_statement';
  if (lowerText.includes('משכורת') || lowerText.includes('salary') || lowerText.includes('payslip'))
    return 'payslip';

  return 'other';
}

/**
 * Extract key information from document text
 */
export function extractDocumentData(
  text: string,
  documentType: ProcessedDocument['documentType']
): ProcessedDocument['extractedData'] {
  const extractedData: ProcessedDocument['extractedData'] = {
    extractedFields: {},
  };

  // Extract creditor name
  const creditorMatch = text.match(/(?:מ|מטעם|מחברת|מ-):?\s*([א-ת\s]+?)(?:\n|$)/);
  if (creditorMatch) extractedData.creditorName = creditorMatch[1].trim();

  // Extract debt amount
  const amountMatch = text.match(/(?:סכום|חוב|סה"כ):?\s*₪?\s*([\d,]+)/);
  if (amountMatch) {
    extractedData.debtAmount = parseInt(amountMatch[1].replace(/,/g, ''), 10);
  }

  // Extract due date
  const dateMatch = text.match(/(?:תאריך|עד|ל-):?\s*(\d{1,2}[./]\d{1,2}[./]\d{2,4})/);
  if (dateMatch) {
    const [day, month, year] = dateMatch[1].split(/[./]/);
    extractedData.dueDate = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10)
    );
  }

  // Extract account/case number
  const accountMatch = text.match(/(?:חשבון|מקרה|תיק):?\s*([א-ת0-9/-]+)/);
  if (accountMatch) extractedData.accountNumber = accountMatch[1].trim();

  const caseMatch = text.match(/(?:תיק|case):?\s*([0-9/-]+)/i);
  if (caseMatch) extractedData.caseNumber = caseMatch[1].trim();

  return extractedData;
}

/**
 * Generate AI summary for document
 */
export function generateDocumentSummary(
  text: string,
  documentType: ProcessedDocument['documentType']
): { summary: string; keyPoints: string[]; riskFactors: string[] } {
  const keyPoints: string[] = [];
  const riskFactors: string[] = [];

  // Extract key points based on document type
  switch (documentType) {
    case 'debt_notice':
      if (text.includes('סכום')) keyPoints.push('הודעה על חוב');
      if (text.includes('ריבית')) keyPoints.push('יש ריביות');
      if (text.includes('עמלה')) keyPoints.push('יש עמלות');
      riskFactors.push('חוב פעיל');
      break;

    case 'warning_letter':
      keyPoints.push('מכתב התראה');
      if (text.includes('בית משפט')) keyPoints.push('עלול להוביל לבית משפט');
      if (text.includes('הוצל"פ')) keyPoints.push('עלול להוביל להוצל"פ');
      riskFactors.push('סכנת הליכים משפטיים');
      break;

    case 'enforcement_notice':
      keyPoints.push('הוצל"פ פעיל');
      if (text.includes('תשלום')) keyPoints.push('דרוש תשלום מיידי');
      riskFactors.push('סכנה גבוהה - הוצל"פ פעיל');
      riskFactors.push('עלול להיות קטע משכורת');
      break;

    case 'bank_statement':
      keyPoints.push('הצהרת בנק');
      if (text.includes('יתרה שלילית')) keyPoints.push('חשבון בתקציר');
      riskFactors.push('בדוק יתרה בחשבון');
      break;

    case 'payslip':
      keyPoints.push('תלוש משכורת');
      riskFactors.push('בדוק אם יש קטע משכורת');
      break;
  }

  const summary = `מסמך מסוג ${documentType}. ${keyPoints.join('. ')}.`;

  return { summary, keyPoints, riskFactors };
}

/**
 * Generate recommended actions based on document
 */
export function generateDocumentActions(
  documentType: ProcessedDocument['documentType'],
  extractedData: ProcessedDocument['extractedData']
): string[] {
  const actions: string[] = [];

  switch (documentType) {
    case 'debt_notice':
      actions.push('בדוק את פרטי החוב');
      actions.push('אם החוב אינו שלך, תחלוק על זה');
      actions.push('צור קשר עם הנושה כדי לדון בתוכנית פירעון');
      break;

    case 'warning_letter':
      actions.push('הגב על המכתב בתוך 30 ימים');
      actions.push('בקש ייעוץ משפטי');
      actions.push('שקול הסדר עם הנושה');
      break;

    case 'enforcement_notice':
      actions.push('בקש ייעוץ משפטי דחוף');
      actions.push('הגש תשובה להוצל"פ');
      actions.push('שקול הסדר עם הנושה');
      actions.push('בדוק אם יש קטע משכורת');
      break;

    case 'bank_statement':
      actions.push('בדוק את היתרה בחשבון');
      actions.push('אם יש יתרה שלילית, שקול הסדר עם הבנק');
      break;

    case 'payslip':
      actions.push('בדוק אם יש קטע משכורת');
      actions.push('אם יש קטע, בקש ייעוץ משפטי');
      break;
  }

  return actions;
}

/**
 * Process uploaded document
 */
export async function processDocument(
  fileName: string,
  fileContent: string,
  fileSize: number
): Promise<ProcessedDocument> {
  const documentType = detectDocumentType(fileName, fileContent);
  const extractedData = extractDocumentData(fileContent, documentType);
  const { summary, keyPoints, riskFactors } = generateDocumentSummary(fileContent, documentType);
  const recommendedActions = generateDocumentActions(documentType, extractedData);

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fileName,
    fileType: fileName.split('.').pop() || 'unknown',
    uploadedAt: new Date(),
    fileSize,
    extractedText: fileContent,
    documentType,
    extractedData,
    aiSummary: summary,
    keyPoints,
    riskFactors,
    recommendedActions,
  };
}
