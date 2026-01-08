'use client';

import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Calendar, Hash, User, CreditCard, Building2, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardHeading } from '@/components/ui/card';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo1/components/toolbar';
import { SettlementBank } from '@/types/settlement-bank.types';
import { settlementBanksService } from '@/services/settlement-banks.service';
import { notify } from '@/lib/notifications';
import { EditSettlementBankModal } from './components/edit-settlement-bank-modal';

export function SettlementBankDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [settlementBank, setSettlementBank] = useState<SettlementBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) {
      fetchSettlementBank(id);
    }
  }, [id]);

  const fetchSettlementBank = async (bankId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await settlementBanksService.getSettlementBank(bankId);
      setSettlementBank(response);
    } catch (err) {
      setError(err as Error);
      notify.error('Failed to load settlement bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettlementBank = async (data: Partial<SettlementBank>) => {
    if (!settlementBank) return;
    
    try {
      const updatedBank = await settlementBanksService.updateSettlementBank(settlementBank.id.toString(), data);
      setSettlementBank(updatedBank);
      notify.success('Settlement bank updated successfully');
    } catch (error) {
      console.error('Failed to update settlement bank:', error);
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a');
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Settlement Bank Details"
              description="Loading..."
            />
          </Toolbar>
        </Container>
        <Container>
          <Card>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-muted-foreground">Loading settlement bank details...</p>
              </div>
            </div>
          </Card>
        </Container>
      </Fragment>
    );
  }

  if (error || !settlementBank) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Settlement Bank Details"
              description="Error loading details"
            />
            <ToolbarActions>
              <Button variant="outline" onClick={() => navigate('/settlement-banks')}>
                <ArrowLeft size={16} />
                Back to Settlement Banks
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
        <Container>
          <Card>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-red-600 font-medium">Error loading settlement bank</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {error?.message || 'Settlement bank not found'}
                </p>
                <div className="mt-4 space-x-2">
                  <Button onClick={() => fetchSettlementBank(id!)}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/settlement-banks')}>
                    Back to Settlement Banks
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={settlementBank.name}
            description="Settlement bank details"
          />
          <ToolbarActions>
            <EditSettlementBankModal
              settlementBank={settlementBank}
              onUpdateSettlementBank={handleUpdateSettlementBank}
            />
            <Button variant="outline" onClick={() => navigate('/settlement-banks')}>
              <ArrowLeft size={16} />
              Back to Settlement Banks
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardHeading>Bank Account Information</CardHeading>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Account Holder</p>
                    <p className="text-sm text-muted-foreground">{settlementBank.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Account Name</p>
                    <p className="text-sm text-muted-foreground">{settlementBank.account_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Account Number</p>
                    <p className="text-sm text-muted-foreground font-mono">{settlementBank.account_no}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bank Name</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {settlementBank.bank_slug.replace(/-/g, ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Code className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bank Code</p>
                    <Badge variant="outline" className="text-xs">
                      {settlementBank.bank_code}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardHeading>System Information</CardHeading>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Settlement Bank ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{settlementBank.code}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(settlementBank.created_at)}
                  </p>
                </div>
              </div>
              {settlementBank.updated_at !== settlementBank.created_at && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(settlementBank.updated_at)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </Fragment>
  );
}
