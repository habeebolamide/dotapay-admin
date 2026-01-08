'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, Phone, Mail, Calendar, CreditCard, Building, User, Wallet, ExternalLink, Loader2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardHeading,
} from '@/components/ui/card';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Customer, CreateCustomerRequest } from '@/types/customer.types';
import { Transaction, CustomerTransactionsResponse } from '@/types/transaction.types';
import { customersService } from '@/services/customers.service';
import { notify } from '@/lib/notifications';
import { EditCustomerModal } from './components/edit-customer-modal';

export function CustomerDetailPage() {
  const navigate = useNavigate();
  const { customerId } = useParams<{ customerId: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [creatingVirtualAccount, setCreatingVirtualAccount] = useState(false);

  const fetchCustomer = useCallback(
    async (options: { withLoading?: boolean } = {}) => {
      if (!customerId) return;

      const { withLoading = true } = options;

      try {
        if (withLoading) setLoading(true);
        setError(null);
        const data = await customersService.getCustomer(customerId);
        setCustomer(data);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to load customer';
        setError(errorMessage);
        notify.loadError('Customer details');
        console.error('Failed to fetch customer:', err);
      } finally {
        if (withLoading) setLoading(false);
      }
    },
    [customerId]
  );

  const fetchTransactions = useCallback(async () => {
    if (!customerId) return;

    try {
      setTransactionsLoading(true);
      setTransactionsError(null);
      const data = await customersService.getCustomerTransactions(customerId, { per_page: 5 });
      setTransactions(data.data);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load transactions';
      setTransactionsError(errorMessage);
      notify.loadError('Transactions');
      console.error('Failed to fetch transactions:', err);
    } finally {
      setTransactionsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
      fetchTransactions();
    }
  }, [customerId, fetchCustomer, fetchTransactions]);

  const handleBack = () => {
    navigate('/customers');
  };

  const handleCopy = async (text: string, label: string = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      notify.copySuccess(label);
    } catch (error) {
      notify.copyError();
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleEditCustomer = async (customerData: Partial<CreateCustomerRequest>) => {
    if (!customerId) return;

    try {
      const updatedCustomer = await customersService.updateCustomer(customerId, customerData);
      setCustomer(updatedCustomer);
      notify.info('Customer information refreshed', {
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to update customer:', error);
      throw error;
    }
  };

  const handleCreateVirtualAccount = async () => {
    if (!customerId) return;

    try {
      setCreatingVirtualAccount(true);
      await customersService.createVirtualAccount(customerId);
      await fetchCustomer({ withLoading: false });
      notify.success('New virtual account generated');
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to generate virtual account';
      notify.error(errorMessage);
    } finally {
      setCreatingVirtualAccount(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading title="Customer Details" />
            <ToolbarActions>
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft size={16} />
                Back to Customers
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
        <Container>
          <Card>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-muted-foreground">Loading customer...</p>
              </div>
            </div>
          </Card>
        </Container>
      </Fragment>
    );
  }

  if (error || !customer) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading title="Customer Details" />
            <ToolbarActions>
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft size={16} />
                Back to Customers
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
        <Container>
          <Card>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-red-600 font-medium">Error loading customer</p>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <Button onClick={handleBack} className="mt-4">
                  Back to Customers
                </Button>
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
            title={`${customer.first_name} ${customer.last_name}`}
            description={customer.email}
          />
          <ToolbarActions>
            <EditCustomerModal
              customer={customer}
              onEditCustomer={handleEditCustomer}
            />
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft size={16} />
              Back to Customers
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardHeading>Customer Information</CardHeading>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{customer.email}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(customer.email, 'Email')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {customer.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{customer.phone}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(customer.phone, 'Phone number')}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Customer Code</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{customer.code}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(customer.code, 'Customer code')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Reference</p>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{customer.reference}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(customer.reference, 'Reference')}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="font-medium">{formatDate(customer.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Virtual Accounts */}
              <Card>
                <CardHeader>
                <div className="flex items-center gap-3">
                  <CardHeading>Virtual Accounts</CardHeading>
                  <Button
                    size="sm"
                    onClick={handleCreateVirtualAccount}
                    disabled={creatingVirtualAccount}
                    className="ml-auto"
                  >
                    {creatingVirtualAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {!creatingVirtualAccount && <Plus className="mr-2 h-4 w-4" />}
                    Generate New
                  </Button>
                </div>
                </CardHeader>
              <CardContent>
                {customer.virtual_accounts && customer.virtual_accounts.length > 0 ? (
                  <div className="space-y-4">
                    {customer.virtual_accounts.map((account) => (
                      <div key={account.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{account.account_name}</h4>
                          <Badge variant={account.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {account.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Account Number</p>
                            <div className="flex items-center gap-2">
                              <p className="font-mono">{account.account_number}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(account.account_number, 'Account number')}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bank Name</p>
                            <p>{account.bank_name}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No virtual accounts yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardHeading>Recent Transactions</CardHeading>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View all
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                    <p className="ml-3 text-sm text-muted-foreground">Loading transactions...</p>
                  </div>
                ) : transactionsError ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-red-600">{transactionsError}</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {formatCurrency((transaction.amount).toString())}
                              </p>
                              <Badge variant={transaction.type === 'deposit' ? 'default' : 'destructive'} className="text-xs">
                                {transaction.type.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {transaction.meta?.sender_account_name && (
                                <span>{transaction.meta.sender_account_name}</span>
                              )}
                              {transaction.meta?.sender_account_bank && (
                                <span>• {transaction.meta.sender_account_bank}</span>
                              )}
                            </div>
                            {transaction.meta?.funding_ref && (
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs text-muted-foreground font-mono">
                                  {transaction.meta.funding_ref}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(transaction.meta.funding_ref, 'Transaction reference')}
                                  className="h-4 w-4 p-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transaction.created_at)}
                          </p>
                          <Badge variant={transaction.confirmed ? 'default' : 'secondary'} className="text-xs">
                            {transaction.confirmed ? 'Confirmed' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardHeading>Status</CardHeading>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={customer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant="outline">
                      {customer.type.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wallet Info */}
            {customer.wallet && (
              <Card>
                <CardHeader>
                  <CardHeading>Wallet</CardHeading>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(customer.wallet.balance)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wallet ID</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm">{customer.wallet.slug}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(customer.wallet.slug, 'Wallet ID')}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </Fragment>
  );
}
