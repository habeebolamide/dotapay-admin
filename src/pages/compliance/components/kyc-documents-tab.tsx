import { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { complianceApi } from '@/services/compliance';
import { toast } from 'sonner';

interface DocumentUpload {
  name: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  file?: File;
}

export const KYCDocumentsTab = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<Record<string, DocumentUpload>>({
    cac1_document: { name: 'Certificate of Incorporation (CAC1)', status: 'pending' },
    cac_form_2: { name: 'CAC Form 2/7 (Company Particulars)', status: 'pending' },
    memorandom_and_articles_of_association: { name: 'Memorandum and Articles of Association', status: 'pending' },
    tax_clearance_certificate: { name: 'Tax Clearance Certificate', status: 'pending' },
    business_permit: { name: 'Business Permit/License (if applicable)', status: 'pending' },
    proof_of_address: { name: 'Proof of Business Address', status: 'pending' },
  });

  const handleFileUpload = (key: string, file: File) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: { ...prev[key], file, status: 'uploaded' },
    }));
  };

  const getStatusBadge = (status: DocumentUpload['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending Upload</Badge>;
      case 'uploaded':
        return <Badge variant="secondary">Uploaded</Badge>;
      case 'verified':
        return <Badge variant="default" className="bg-green-500">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: DocumentUpload['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'uploaded':
        return <FileText className="w-5 h-5 text-primary" />;
      default:
        return <Upload className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Add all uploaded files to FormData
      Object.entries(documents).forEach(([key, doc]) => {
        if (doc.file) {
          formData.append(key, doc.file);
        }
      });

      const response = await complianceApi.storeKYCDocuments(formData);

      toast.success(response.message || 'KYC documents uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload KYC documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-5">
      <div>
        <h3 className="text-lg font-semibold mb-1">KYC Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload required business registration and compliance documents. All documents must be clear, valid, and in PDF, JPG, or PNG format (max 5MB each)
        </p>
      </div>

      <div className="space-y-4">
        {Object.entries(documents).map(([key, doc]) => (
          <div
            key={key}
            className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">{getStatusIcon(doc.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Label className="font-medium text-sm">{doc.name}</Label>
                    {getStatusBadge(doc.status)}
                  </div>
                  {doc.file && (
                    <p className="text-xs text-muted-foreground truncate">
                      {doc.file.name}
                    </p>
                  )}
                  {key === 'cac_cert' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Issued by Corporate Affairs Commission showing company registration
                    </p>
                  )}
                  {key === 'cac_form' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Details of company directors, shareholders, and registered address
                    </p>
                  )}
                  {key === 'tax_clearance' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Valid tax clearance certificate from FIRS (not older than 12 months)
                    </p>
                  )}
                  {key === 'proof_address' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Utility bill, lease agreement, or property document (not older than 3 months)
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,.jpg,.jpeg,.png';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleFileUpload(key, file);
                    };
                    input.click();
                  }}
                >
                  {doc.status === 'pending' ? 'Upload' : 'Replace'}
                </Button>
                {doc.status === 'uploaded' && doc.file && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Open file in new tab
                      const url = URL.createObjectURL(doc.file as File);
                      window.open(url, '_blank');
                    }}
                  >
                    View
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Document Requirements
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
          <li>All documents must be official copies from issuing authorities</li>
          <li>Documents must be valid and not expired (where applicable)</li>
          <li>Scanned copies must be clear and legible</li>
          <li>File formats: PDF, JPG, JPEG, or PNG only</li>
          <li>Maximum file size: 5MB per document</li>
          <li>Tax clearance must not be older than 12 months</li>
          <li>Proof of address must not be older than 3 months</li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2.5 border-t">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Uploading...' : 'Save & Continue'}
        </Button>
      </div>
    </form>
  );
};
