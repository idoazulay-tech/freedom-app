import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Trash2, Download } from 'lucide-react';
import { trpc } from '@/lib/trpc';

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

  // Fetch documents from server
  const { data: fetchedDocuments, isLoading } = (trpc.diagnosis as any).listDocuments.useQuery();

  // Mutation to save document
  const saveDocumentMutation = (trpc.diagnosis as any).saveDocument.useMutation({
    onSuccess: (newDoc: Document) => {
      setDocuments((prev) => [newDoc, ...prev]);
    },
  });

  // Mutation to delete document
  const deleteDocumentMutation = (trpc.diagnosis as any).deleteDocument.useMutation({
    onSuccess: (deletedId: string) => {
      setDocuments((prev) => prev.filter((doc) => doc.id !== deletedId));
    },
  });

  useEffect(() => {
    if (fetchedDocuments) {
      const docsWithDates = fetchedDocuments.map((doc: any) => ({
        ...doc,
        uploadedAt: typeof doc.uploadedAt === 'string' ? new Date(doc.uploadedAt) : doc.uploadedAt,
      }));
      setDocuments(docsWithDates);
    }
  }, [fetchedDocuments]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    for (const file of Array.from(files)) {
      try {
        const text = await file.text();
        
        // Send to server for processing
        saveDocumentMutation.mutate({
          fileName: file.name,
          fileType: file.name.split('.').pop() || 'unknown',
          fileSize: file.size,
          fileContent: text,
        });
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
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'warning_letter':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'enforcement_notice':
        return 'bg-red-600/20 text-red-200 border-red-600/30';
      case 'bank_statement':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'payslip':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6 text-center">
          <p className="text-slate-400">טוען מסמכים...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />
            מסמכים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-slate-500 transition"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-300 font-medium">גרור מסמכים כאן או לחץ להעלאה</p>
              <p className="text-slate-500 text-sm">PDF, תמונות, וקבצי טקסט</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
              />
            </div>

            {uploading && (
              <div className="text-center text-slate-400">
                <p>מעלה מסמכים...</p>
              </div>
            )}

            {/* Documents Count */}
            <div className="flex items-center justify-between">
              <span className="text-slate-300">סה"כ מסמכים: {documents.length}</span>
              {documents.length > 0 && (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {documents.length} מסמכים
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{doc.fileName}</h3>
                      <p className="text-slate-400 text-sm">
                        {formatDate(doc.uploadedAt)} • {formatFileSize(doc.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getDocumentTypeColor(doc.documentType)} text-xs`}>
                    {getDocumentTypeLabel(doc.documentType)}
                  </Badge>
                </div>

                {/* AI Summary */}
                {doc.aiSummary && (
                  <div className="bg-slate-700/50 rounded p-3">
                    <p className="text-slate-300 text-sm">{doc.aiSummary}</p>
                  </div>
                )}

                {/* Key Points */}
                {doc.keyPoints.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-2">נקודות חשובות:</p>
                    <ul className="space-y-1">
                      {doc.keyPoints.slice(0, 3).map((point, idx) => (
                        <li key={idx} className="text-slate-300 text-sm flex gap-2">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risk Factors */}
                {doc.riskFactors.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-2">גורמי סיכון:</p>
                    <div className="flex flex-wrap gap-2">
                      {doc.riskFactors.slice(0, 3).map((factor, idx) => (
                        <Badge key={idx} className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                {doc.recommendedActions.length > 0 && (
                  <div>
                    <p className="text-slate-400 text-xs font-semibold mb-2">פעולות מומלצות:</p>
                    <ul className="space-y-1">
                      {doc.recommendedActions.slice(0, 2).map((action, idx) => (
                        <li key={idx} className="text-slate-300 text-sm flex gap-2">
                          <AlertCircle className="w-3 h-3 text-orange-400 flex-shrink-0 mt-0.5" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => {
                      // Download logic
                      console.log('Download:', doc.id);
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    הורד
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-400 hover:text-red-300"
                    onClick={() => deleteDocumentMutation.mutate({ documentId: doc.id })}
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    מחק
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {documents.length === 0 && !uploading && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400">אין מסמכים עדיין</p>
            <p className="text-slate-500 text-sm">העלה מסמכים כדי לקבל ניתוח AI</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
