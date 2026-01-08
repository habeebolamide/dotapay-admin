import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { bankService } from '@/services/bank.service';
import { Bank } from '@/types/bank.types';
import { notify } from '@/lib/notifications';

interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  bvn: string;
  isPrimary: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  fetchingAccount?: boolean;
}

export const BankingInformationTab = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [accounts, setAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      bankName: '',
      bankCode: '',
      accountNumber: '',
      accountName: '',
      accountType: '',
      bvn: '',
      isPrimary: true,
      verificationStatus: 'pending',
      fetchingAccount: false,
    },
  ]);
  const lookupTimers = useRef<Record<string, ReturnType<typeof setTimeout> | undefined>>({});
  const lastLookupKeyRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const loadBanks = async () => {
      setLoadingBanks(true);
      try {
        const data = await bankService.getBanks();
        setBanks(data);
      } catch (error) {
        console.error('Error fetching banks:', error);
        notify.error('Failed to load banks. Please try again.');
      } finally {
        setLoadingBanks(false);
      }
    };

    loadBanks();
  }, []);

  const filteredBanks = useMemo(() => {
    const term = bankSearch.trim().toLowerCase();
    if (!term) return banks;
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(term) ||
        bank.code.toLowerCase().includes(term)
    );
  }, [bankSearch, banks]);

  const addAccount = () => {
    setAccounts([
      ...accounts,
      {
        id: Date.now().toString(),
        bankName: '',
        bankCode: '',
        accountNumber: '',
        accountName: '',
        accountType: '',
        bvn: '',
        isPrimary: false,
        verificationStatus: 'pending',
        fetchingAccount: false,
      },
    ]);
  };

  const removeAccount = (id: string) => {
    if (accounts.length > 1) {
      setAccounts(accounts.filter((a) => a.id !== id));
    }
  };

  const updateAccount = (
    id: string,
    field: keyof BankAccount,
    value: string | boolean
  ) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const next = { ...a, [field]: value } as BankAccount;
          return next;
        }
        if (field === 'isPrimary' && value === true) {
          return { ...a, isPrimary: false };
        }
        return a;
      })
    );
  };

  const updateAccountFields = (id: string, updates: Partial<BankAccount>) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id !== id) {
          if (updates.isPrimary) {
            return { ...a, isPrimary: false };
          }
          return a;
        }
        return { ...a, ...updates };
      })
    );
  };

  const scheduleAccountLookup = (accountId: string, bankCode: string, accountNumber: string) => {
    if (lookupTimers.current[accountId]) {
      clearTimeout(lookupTimers.current[accountId]);
    }

    if (accountNumber.length === 10 && bankCode) {
      const lookupKey = `${bankCode}-${accountNumber}`;
      if (lastLookupKeyRef.current[accountId] === lookupKey) {
        return;
      }
      lookupTimers.current[accountId] = setTimeout(() => {
        lastLookupKeyRef.current[accountId] = lookupKey;
        fetchAccountName(accountId, bankCode, accountNumber);
      }, 300);
      return;
    }

    lastLookupKeyRef.current[accountId] = '';
    updateAccountFields(accountId, { accountName: '', fetchingAccount: false });
  };

  const fetchAccountName = async (accountId: string, bankCode: string, accountNumber: string) => {
    updateAccountFields(accountId, { fetchingAccount: true });
    try {
      const result = await bankService.fetchAccount({
        bank_code: bankCode,
        account_number: accountNumber,
      });
      const resolvedName = result.account_name || result.bank_name || '';
      const lookupKey = `${bankCode}-${accountNumber}`;
      if (lastLookupKeyRef.current[accountId] !== lookupKey) {
        return;
      }
      updateAccountFields(accountId, { accountName: resolvedName || '', fetchingAccount: false });
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch account name. Please check details.';
      if (lastLookupKeyRef.current[accountId] !== `${bankCode}-${accountNumber}`) {
        return;
      }
      lastLookupKeyRef.current[accountId] = '';
      updateAccountFields(accountId, { accountName: '', fetchingAccount: false });
      notify.error(message);
    } finally {
      updateAccountFields(accountId, { fetchingAccount: false });
    }
  };

  const verifyAccount = (id: string) => {
    // Simulate account verification
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, verificationStatus: 'verified' } : a
        )
      );
    }, 1000);
  };

  const getVerificationBadge = (status: BankAccount['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="default" className="bg-green-500 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Pending Verification</Badge>;
    }
  };

  return (
    <div className="space-y-6 py-5">
      <div>
        <h3 className="text-lg font-semibold mb-1">Banking Information</h3>
        <p className="text-sm text-muted-foreground">
          Add your business bank accounts for settlement. At least one verified account is required. All accounts must be in the business name.
        </p>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Important Information
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
          <li>All bank accounts must be registered in your business name</li>
          <li>BVN must match the account holder's BVN</li>
          <li>At least one account must be designated as primary for settlements</li>
          <li>Account verification is required before you can receive payments</li>
          <li>Ensure account details are accurate to avoid verification failures</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-medium">Settlement Accounts</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={addAccount}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Button>
        </div>

        <div className="space-y-4">
          {accounts.map((account, index) => (
            <Card key={account.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">
                      Bank Account {index + 1}
                    </CardTitle>
                    {account.isPrimary && (
                      <Badge variant="default">Primary</Badge>
                    )}
                    {getVerificationBadge(account.verificationStatus)}
                  </div>
                  {accounts.length > 1 && !account.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAccount(account.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2.5">
                    <Label>
                      Bank Name <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={account.bankCode}
                      onValueChange={(value) => {
                        const selectedBank = banks.find((bank) => bank.code === value);
                        updateAccountFields(account.id, {
                          bankName: selectedBank?.name || '',
                          bankCode: selectedBank?.code || '',
                        });
                        scheduleAccountLookup(account.id, value, account.accountNumber);
                        setBankSearch('');
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingBanks ? 'Loading banks...' : 'Select bank'} />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2 sticky top-0 bg-popover">
                          <Input
                            placeholder="Search bank..."
                            value={bankSearch}
                            onChange={(event) => setBankSearch(event.target.value)}
                            onKeyDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                            autoComplete="off"
                          />
                        </div>
                        {loadingBanks ? (
                          <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Loading banks...
                          </div>
                        ) : filteredBanks.length ? (
                          filteredBanks.map((bank) => (
                            <SelectItem key={bank.code} value={bank.code}>
                              {bank.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            No banks found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>
                      Account Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="10-digit NUBAN"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="off"
                      value={account.accountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        updateAccountFields(account.id, { accountNumber: value });
                        scheduleAccountLookup(account.id, account.bankCode, value);
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2.5">
                    <Label>
                      Account Name <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Account name will auto-fill"
                        value={account.accountName}
                        readOnly
                        aria-readonly="true"
                        required
                        disabled={account.verificationStatus === 'verified'}
                      />
                      {account.fetchingAccount && (
                        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>
                    {account.verificationStatus === 'verified' && (
                      <p className="text-xs text-muted-foreground">
                        Account name verified
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Label>
                      Account Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={account.accountType}
                      onValueChange={(value) =>
                        updateAccount(account.id, 'accountType', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current Account</SelectItem>
                        <SelectItem value="savings">Savings Account</SelectItem>
                        <SelectItem value="corporate">Corporate Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <Label>
                    BVN (Bank Verification Number){' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="11-digit BVN"
                    maxLength={11}
                    value={account.bvn}
                    onChange={(e) =>
                      updateAccount(account.id, 'bvn', e.target.value)
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    BVN must match the account signatory
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`primary-${account.id}`}
                      checked={account.isPrimary}
                      onChange={(e) =>
                        updateAccount(account.id, 'isPrimary', e.target.checked)
                      }
                      className="rounded"
                    />
                    <Label
                      htmlFor={`primary-${account.id}`}
                      className="font-normal cursor-pointer"
                    >
                      Set as primary settlement account
                    </Label>
                  </div>

                  {account.verificationStatus === 'pending' &&
                    account.accountNumber.length === 10 &&
                    account.bankName && (
                      <Button
                        size="sm"
                        onClick={() => verifyAccount(account.id)}
                      >
                        Verify Account
                      </Button>
                    )}

                  {account.verificationStatus === 'failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyAccount(account.id)}
                    >
                      Retry Verification
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <h4 className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">
          Settlement Information
        </h4>
        <p className="text-xs text-blue-800 dark:text-blue-200">
          Settlements will be processed to your primary account within 24-48 hours after transactions are completed.
          Ensure your account details are correct to avoid delays in receiving your funds.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2.5 border-t">
        <Button variant="outline">Back</Button>
        <Button>Complete Submission</Button>
      </div>
    </div>
  );
};
