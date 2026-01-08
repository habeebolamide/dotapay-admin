import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  BusinessInformationTab,
  KYCDocumentsTab,
  DirectorsShareholdersTab,
  ComplianceDocumentsTab,
  BankingInformationTab,
} from './components';
import { complianceApi } from '@/services/compliance';
import type { ComplianceDocuments } from '@/services/types/compliance.types';
import { toast } from 'sonner';

export function ComplianceContent() {
  const [activeTab, setActiveTab] = useState('business-info');
  const [isLoading, setIsLoading] = useState(true);
  const [complianceData, setComplianceData] =
    useState<ComplianceDocuments | null>(null);

  useEffect(() => {
    const fetchComplianceDetails = async () => {
      try {
        const response = await complianceApi.getComplianceDetails();
        const documents = response?.data?.compliance_documents;

        if (documents) {
          setComplianceData(documents);
        }
      } catch (error: any) {
        toast.error(
          error?.message || 'Failed to fetch compliance information'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplianceDetails();
  }, []);

  return (
    <Card className="pb-2.5">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full px-5 pt-5">
          <TabsTrigger value="business-info">Business Information</TabsTrigger>
          <TabsTrigger value="kyc-documents">KYC Documents</TabsTrigger>
          <TabsTrigger value="directors">Directors & Shareholders</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Documents</TabsTrigger>
          <TabsTrigger value="banking">Banking Information</TabsTrigger>
        </TabsList>

        <TabsContent value="business-info" className="px-5">
          <BusinessInformationTab
            initialData={complianceData}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="kyc-documents" className="px-5">
          <KYCDocumentsTab />
        </TabsContent>

        <TabsContent value="directors" className="px-5">
          <DirectorsShareholdersTab
            complianceId={complianceData?.id}
            initialDirectors={complianceData?.directors}
            initialShareholders={complianceData?.shareholders}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="compliance" className="px-5">
          <ComplianceDocumentsTab
            complianceId={complianceData?.id}
            initialData={complianceData}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="banking" className="px-5">
          <BankingInformationTab />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
