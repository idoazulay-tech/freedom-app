import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Trash2, Download } from 'lucide-react';

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  fileSize: number;
  documentType: 'debt_notice' | 'warning_letter' | 'enforcement_notice' | 'bank_statement' | 'payslip' | 'other';
  aiSummary: string;
  keyPoints: string[];
  riskFactors: string[];
  recommendedActions: string[];
}

export default function DocumentsSection() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        const documentType = detectDocumentType(file.name, text);
        const extractedData = extractDocumentData(text, documentType);
        const { summary, keyPoints, riskFactors } = generateDocumentSummary(text, documentType);
        const recommendedActions = generateDocumentActions(documentType, extractedData);

        const newDoc: Document = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          fileType: file.name.split('.').pop() || 'unknown',
          uploadedAt: new Date(),
          fileSize: file.size,
          documentType,
          aiSummary: summary,
          keyPoints,
          riskFactors,
          recommendedActions,
        };

        setDocuments((prev) => [newDoc, ...prev]);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
    setUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'debt_notice':
        return 'הודעת חוב';
      case 'warning_letter':
        return 'מכתב התראה';
      case 'enforcement_notice':
        return 'הוצל"פ';
      case 'bank_statement':
        return 'הצהרת בנק';
      case 'payslip':
        return 'תלוש משכורת';
      default:
        return 'אחר';
    }
  };

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case 'debt_notice':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'warning_letter':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'enforcement_notice':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'bank_statement':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'payslip':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getRiskIcon = (riskFactors: string[]) => {
    if (riskFactors.length > 0) {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Upload className="w-5 h-5" />
            העלה מסמכים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-slate-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-300 font-semibold mb-1">
              {uploading ? 'מעלה...' : 'גרור קבצים כאן או לחץ להעלאה'}
            </p>
            <p className="text-slate-400 text-sm">
              תמוך ב: PDF, תמונות, קבצי Word, וקבצי טקסט
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="bg-slate-800 border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-slate-400" />
                        <div>
                          <h3 className="font-semibold text-white">{doc.fileName}</h3>
                          <p className="text-slate-400 text-sm">
                            {new Date(doc.uploadedAt).toLocaleDateString('he-IL')} •{' '}
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getDocumentTypeColor(doc.documentType)}`}>
                        {getDocumentTypeLabel(doc.documentType)}
                      </Badge>
                    </div>

                    {/* Summary */}
                    <p className="text-slate-300 text-sm mb-3">{doc.aiSummary}</p>

                    {/* Key Points */}
                    {doc.keyPoints.length > 0 && (
                      <div className="mb-3">
                        <p className="text-slate-400 text-xs font-semibold mb-1">נקודות חשובות:</p>
                        <div className="flex flex-wrap gap-1">
                          {doc.keyPoints.map((point, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-slate-700/50 text-slate-300 border-slate-600 text-xs"
                            >
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Risk Factors */}
                    {doc.riskFactors.length > 0 && (
                      <div className="mb-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-red-300 text-xs font-semibold mb-1">גורמי סיכון:</p>
                            <ul className="text-red-200 text-xs space-y-0.5">
                              {doc.riskFactors.map((factor, idx) => (
                                <li key={idx}>• {factor}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommended Actions */}
                    {doc.recommendedActions.length > 0 && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-blue-300 text-xs font-semibold mb-1">פעולות מומלצות:</p>
                        <ul className="text-blue-200 text-xs space-y-0.5">
                          {doc.recommendedActions.map((action, idx) => (
                            <li key={idx}>• {action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => setDocuments((prev) => prev.filter((d) => d.id !== doc.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">אין מסמכים עדיין. העלה מסמכים כדי להתחיל.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper functions
function detectDocumentType(
  fileName: string,
  text: string
): Document['documentType'] {
  const lowerFileName = fileName.toLowerCase();
  const lowerText = text.toLowerCase();

  if (lowerFileName.includes('הודעה') || lowerFileName.includes('notice')) return 'debt_notice';
  if (lowerFileName.includes('התראה') || lowerFileName.includes('warning')) return 'warning_letter';
  if (lowerFileName.includes('הוצל"פ') || lowerFileName.includes('enforcement'))
    return 'enforcement_notice';
  if (lowerFileName.includes('בנק') || lowerFileName.includes('bank')) return 'bank_statement';
  if (lowerFileName.includes('משכורת') || lowerFileName.includes('payslip')) return 'payslip';

  if (lowerText.includes('הודעה על חוב') || lowerText.includes('debt notice'))
    return 'debt_notice';
  if (lowerText.includes('התראה') || lowerText.includes('warning')) return 'warning_letter';
  if (lowerText.includes('הוצל"פ') || lowerText.includes('enforcement')) return 'enforcement_notice';
  if (lowerText.includes('בנק') || lowerText.includes('bank')) return 'bank_statement';
  if (lowerText.includes('משכורת') || lowerText.includes('salary')) return 'payslip';

  return 'other';
}

function extractDocumentData(text: string, documentType: Document['documentType']) {
  const data: any = { extractedFields: {} };

  const creditorMatch = text.match(/(?:מ|מטעם|מחברת|מ-):?\s*([א-ת\s]+?)(?:\n|$)/);
  if (creditorMatch) data.creditorName = creditorMatch[1].trim();

  const amountMatch = text.match(/(?:סכום|חוב|סה"כ):?\s*₪?\s*([\d,]+)/);
  if (amountMatch) data.debtAmount = parseInt(amountMatch[1].replace(/,/g, ''), 10);

  const dateMatch = text.match(/(?:תאריך|עד|ל-):?\s*(\d{1,2}[./]\d{1,2}[./]\d{2,4})/);
  if (dateMatch) {
    const [day, month, year] = dateMatch[1].split(/[./]/);
    data.dueDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  }

  return data;
}

function generateDocumentSummary(text: string, documentType: Document['documentType']) {
  const keyPoints: string[] = [];
  const riskFactors: string[] = [];

  switch (documentType) {
    case 'debt_notice':
      if (text.includes('סכום')) keyPoints.push('הודעה על חוב');
      if (text.includes('ריבית')) keyPoints.push('יש ריביות');
      riskFactors.push('חוב פעיל');
      break;
    case 'warning_letter':
      keyPoints.push('מכתב התראה');
      riskFactors.push('סכנת הליכים משפטיים');
      break;
    case 'enforcement_notice':
      keyPoints.push('הוצל"פ פעיל');
      riskFactors.push('סכנה גבוהה - הוצל"פ פעיל');
      break;
  }

  return {
    summary: `מסמך מסוג ${documentType}. ${keyPoints.join('. ')}.`,
    keyPoints,
    riskFactors,
  };
}

function generateDocumentActions(documentType: Document['documentType'], data: any) {
  const actions: string[] = [];

  switch (documentType) {
    case 'debt_notice':
      actions.push('בדוק את פרטי החוב');
      actions.push('צור קשר עם הנושה');
      break;
    case 'warning_letter':
      actions.push('הגב על המכתב בתוך 30 ימים');
      actions.push('בקש ייעוץ משפטי');
      break;
    case 'enforcement_notice':
      actions.push('בקש ייעוץ משפטי דחוף');
      actions.push('הגש תשובה להוצל"פ');
      break;
  }

  return actions;
}
