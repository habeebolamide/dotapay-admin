'use client';

import { useEffect, useMemo, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Eye, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { complianceApi } from '@/services/compliance';
import { uploadService } from '@/services/upload.service';
import type { ComplianceDocuments } from '@/services/types/compliance.types';

type ComplianceDocumentsTabProps = {
  complianceId?: number | string;
  initialData?: ComplianceDocuments | null;
  isLoading?: boolean;
};

type DocumentKey =
  | 'aml_cft_policy_document'
  | 'kyc_cdd_policy'
  | 'data_protection_policy_document'
  | 'business_plan_document'
  | 'audited_financial_statements_document';

type DocumentState = {
  name: string;
  description: string;
  required: boolean;
  value: {
    url: string;
    name: string;
    uploading: boolean;
  } | null;
};

const extractFileName = (url: string) => {
  try {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1] || 'document');
  } catch {
    return 'document';
  }
};

const DEFAULT_DOCUMENTS: Record<DocumentKey, Omit<DocumentState, 'value'>> = {
  aml_cft_policy_document: {
    name: 'AML/CFT Policy Document',
    description: 'Anti-Money Laundering and Counter-Terrorism Financing policy',
    required: true,
  },
  kyc_cdd_policy: {
    name: 'KYC/CDD Policy',
    description: 'Know Your Customer and Customer Due Diligence procedures',
    required: true,
  },
  data_protection_policy_document: {
    name: 'Data Protection Policy',
    description: 'NDPR compliance and customer data handling procedures',
    required: true,
  },
  business_plan_document: {
    name: 'Business Plan',
    description: 'Detailed business plan outlining operations and projections',
    required: false,
  },
  audited_financial_statements_document: {
    name: 'Audited Financial Statements',
    description: 'Last 2 years of audited accounts (if applicable)',
    required: false,
  },
};

export function ComplianceDocumentsTab({
  complianceId,
  initialData,
  isLoading,
}: ComplianceDocumentsTabProps) {
  const [amlPolicy, setAmlPolicy] = useState('');
  const [dataProtection, setDataProtection] = useState('');
  const [expectedMonthlyVolume, setExpectedMonthlyVolume] = useState('');
  const [expectedMonthlyValue, setExpectedMonthlyValue] = useState('');
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [certifications, setCertifications] = useState({
    noMoneyLaundering: false,
    noTerrorismFinancing: false,
    accurateInformation: false,
    regulatoryCompliance: false,
    dataProtectionAwareness: false,
  });

  const [documents, setDocuments] = useState<Record<DocumentKey, DocumentState>>(() =>
    Object.entries(DEFAULT_DOCUMENTS).reduce(
      (acc, [key, config]) => ({
        ...acc,
        [key as DocumentKey]: {
          ...config,
          value: null,
        },
      }),
      {} as Record<DocumentKey, DocumentState>
    )
  );

  useEffect(() => {
    if (!initialData) return;

    setAmlPolicy(initialData.aml_policy_description ?? '');
    setDataProtection(initialData.data_protection_measures ?? '');
    setExpectedMonthlyVolume(initialData.expected_monthly_transaction_volume ?? '');
    setExpectedMonthlyValue(initialData.expected_monthly_transaction_value ?? '');
    setSourceOfFunds(initialData.source_of_business_funds ?? '');

    setCertifications({
      noMoneyLaundering: Boolean(initialData.no_money_laundering),
      noTerrorismFinancing: Boolean(initialData.business_does_not_finance_terrorism),
      accurateInformation: Boolean(initialData.accurate_data_provided),
      regulatoryCompliance: Boolean(initialData.cbn_and_nfiu_regulations_compliant),
      dataProtectionAwareness: Boolean(initialData.ndpr_compliant),
    });

    setDocuments((prev) => {
      const updated = { ...prev };

      (
        [
          'aml_cft_policy_document',
          'kyc_cdd_policy',
          'data_protection_policy_document',
          'business_plan_document',
          'audited_financial_statements_document',
        ] as DocumentKey[]
      ).forEach((key) => {
        const url = initialData[key];
        updated[key] = {
          ...prev[key],
          value: url
            ? {
                url: String(url),
                name: extractFileName(String(url)),
                uploading: false,
              }
            : null,
        };
      });

      return updated;
    });
  }, [initialData]);

  const handleFileUpload = async (key: DocumentKey) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should not exceed 10MB.');
        return;
      }

      const documentTitle = documents[key].name;

      setDocuments((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          value: {
            url: '',
            name: file.name,
            uploading: true,
          },
        },
      }));

      try {
        const url = await uploadService.uploadDocument(file);
        setDocuments((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            value: {
              url,
              name: file.name,
              uploading: false,
            },
          },
        }));
        toast.success(`${documentTitle} uploaded successfully`);
      } catch (error: any) {
        toast.error(error?.message || 'Failed to upload document');
        setDocuments((prev) => ({
          ...prev,
          [key]: {
            ...prev[key],
            value: null,
          },
        }));
      }
    };

    input.click();
  };

  const handleRemoveDocument = (key: DocumentKey) => {
    setDocuments((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: null,
      },
    }));
  };

  const validateForm = () => {
    if (!amlPolicy.trim() || !dataProtection.trim()) {
      toast.error('Please provide AML and Data Protection information.');
      return false;
    }

    if (!expectedMonthlyVolume.trim() || !expectedMonthlyValue.trim()) {
      toast.error('Expected monthly transaction volume and value are required.');
      return false;
    }

    if (!sourceOfFunds.trim()) {
      toast.error('Please specify the primary source of business funds.');
      return false;
    }

    const allCertifications = Object.values(certifications).every(Boolean);
    if (!allCertifications) {
      toast.error('Kindly confirm all compliance certifications.');
      return false;
    }

    for (const [key, doc] of Object.entries(documents) as Array<[DocumentKey, DocumentState]>) {
      if (doc.required && !doc.value?.url) {
        toast.error(`Please upload the ${doc.name}.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!complianceId) {
      toast.error('Compliance ID is missing. Please refresh the page.');
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        aml_policy_description: amlPolicy.trim(),
        data_protection_measures: dataProtection.trim(),
        expected_monthly_transaction_volume: expectedMonthlyVolume.trim(),
        expected_monthly_transaction_value: expectedMonthlyValue.trim(),
        source_of_business_funds: sourceOfFunds.trim(),
        aml_cft_policy_document: documents.aml_cft_policy_document.value?.url,
        kyc_cdd_policy: documents.kyc_cdd_policy.value?.url,
        data_protection_policy_document: documents.data_protection_policy_document.value?.url,
        business_plan_document: documents.business_plan_document.value?.url,
        audited_financial_statements_document: documents.audited_financial_statements_document.value?.url,
        no_money_laundering: certifications.noMoneyLaundering,
        business_does_not_finance_terrorism: certifications.noTerrorismFinancing,
        accurate_data_provided: certifications.accurateInformation,
        cbn_and_nfiu_regulations_compliant: certifications.regulatoryCompliance,
        ndpr_compliant: certifications.dataProtectionAwareness,
      };

      const response = await complianceApi.storeComplianceDocuments(complianceId, payload);
      toast.success(response?.message || 'Compliance documents saved successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save compliance documents');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUploading = useMemo(
    () =>
      Object.values(documents).some((doc) => doc.value?.uploading),
    [documents]
  );

  return (
    <div className="space-y-6 py-5">
      <div>
        <h3 className="text-lg font-semibold mb-1">Compliance Documents & Policies</h3>
        <p className="text-sm text-muted-foreground">
          Upload compliance policies and provide information on your AML/CFT procedures as required by CBN regulations
        </p>
      </div>

      <div className="space-y-5">
        <h4 className="text-base font-medium">Anti-Money Laundering (AML) Information</h4>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="aml_policy">
            Describe your AML/CFT procedures <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="aml_policy"
            rows={4}
            placeholder="Describe how your business identifies, monitors, and reports suspicious transactions..."
            value={amlPolicy}
            onChange={(event) => setAmlPolicy(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Include customer screening, transaction monitoring, and reporting procedures
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="data_protection">
            Data Protection & Privacy Measures <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="data_protection"
            rows={4}
            placeholder="Describe how you protect customer data and comply with NDPR..."
            value={dataProtection}
            onChange={(event) => setDataProtection(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Explain your data encryption, storage, and customer privacy practices
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <h4 className="text-base font-medium">Expected Transaction Volumes</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2.5">
            <Label htmlFor="monthly_volume">
              Expected Monthly Transaction Volume <span className="text-destructive">*</span>
            </Label>
            <Input
              id="monthly_volume"
              placeholder="e.g., Between 2,000 and 3,000 transactions"
              value={expectedMonthlyVolume}
              onChange={(event) => setExpectedMonthlyVolume(event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <Label htmlFor="monthly_value">
              Expected Monthly Transaction Value <span className="text-destructive">*</span>
            </Label>
            <Input
              id="monthly_value"
              placeholder="e.g., ₦50,000,000 - ₦75,000,000"
              value={expectedMonthlyValue}
              onChange={(event) => setExpectedMonthlyValue(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="source_of_funds">
            Source of Business Funds <span className="text-destructive">*</span>
          </Label>
          <Input
            id="source_of_funds"
            placeholder="Select or describe primary source"
            value={sourceOfFunds}
            onChange={(event) => setSourceOfFunds(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-base font-medium">Policy Documents</h4>

        {(Object.entries(documents) as Array<[DocumentKey, DocumentState]>).map(([key, doc]) => (
          <div
            key={key}
            className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {doc.value?.uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    (doc.value?.url && <FileText className="w-5 h-5 text-primary" />) ||
                    (doc.required ? <AlertCircle className="w-5 h-5 text-muted-foreground" /> : <Upload className="w-5 h-5 text-muted-foreground" />)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Label className="font-medium text-sm">{doc.name}</Label>
                    {doc.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    {doc.value?.url ? (
                      <Badge variant="secondary">Uploaded</Badge>
                    ) : (
                      <Badge variant="outline">Pending Upload</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{doc.description}</p>
                  {doc.value?.name && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {doc.value.name}
                      {doc.value.uploading ? ' (uploading...)' : ''}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFileUpload(key)}
                  disabled={doc.value?.uploading || isSubmitting || isLoading}
                >
                  {doc.value?.url ? 'Replace' : 'Upload'}
                </Button>
                {doc.value?.url && !doc.value.uploading && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.value?.url ?? '#', '_blank', 'noopener')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {!doc.required && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDocument(key)}
                      >
                        <XCircle className="w-4 h-4 mr-1 text-muted-foreground" />
                        Remove
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h4 className="text-base font-medium">Compliance Certifications</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Please confirm the following statements by checking the boxes below
        </p>

        <div className="space-y-3 border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="cert1"
              checked={certifications.noMoneyLaundering}
              onCheckedChange={(checked) =>
                setCertifications((prev) => ({ ...prev, noMoneyLaundering: checked as boolean }))
              }
            />
            <Label htmlFor="cert1" className="font-normal text-sm cursor-pointer">
              I certify that this business will not be used for money laundering or any illegal activities
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cert2"
              checked={certifications.noTerrorismFinancing}
              onCheckedChange={(checked) =>
                setCertifications((prev) => ({
                  ...prev,
                  noTerrorismFinancing: checked as boolean,
                }))
              }
            />
            <Label htmlFor="cert2" className="font-normal text-sm cursor-pointer">
              I certify that this business does not finance terrorism or support sanctioned entities
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cert3"
              checked={certifications.accurateInformation}
              onCheckedChange={(checked) =>
                setCertifications((prev) => ({
                  ...prev,
                  accurateInformation: checked as boolean,
                }))
              }
            />
            <Label htmlFor="cert3" className="font-normal text-sm cursor-pointer">
              I certify that all information provided is accurate, complete, and up-to-date
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cert4"
              checked={certifications.regulatoryCompliance}
              onCheckedChange={(checked) =>
                setCertifications((prev) => ({
                  ...prev,
                  regulatoryCompliance: checked as boolean,
                }))
              }
            />
            <Label htmlFor="cert4" className="font-normal text-sm cursor-pointer">
              I agree to comply with all CBN regulations and NFIU reporting requirements
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="cert5"
              checked={certifications.dataProtectionAwareness}
              onCheckedChange={(checked) =>
                setCertifications((prev) => ({
                  ...prev,
                  dataProtectionAwareness: checked as boolean,
                }))
              }
            />
            <Label htmlFor="cert5" className="font-normal text-sm cursor-pointer">
              I acknowledge compliance with Nigeria Data Protection Regulation (NDPR)
            </Label>
          </div>
        </div>
      </div>

  <div className="flex justify-between items-center pt-2.5 border-t">
        <Button type="button" variant="outline" disabled={isSubmitting}>
          Back
        </Button>
        <Button
          type="button"
          disabled={
            isSubmitting ||
            isUploading ||
            isLoading ||
            !complianceId
          }
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Saving...' : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
