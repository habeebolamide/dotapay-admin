'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateSettlementBankRequest } from '@/types/settlement-bank.types';
import { bankService } from '@/services/bank.service';
import { Bank } from '@/types/bank.types';
import { notify } from '@/lib/notifications';

const formSchema = z.object({
  name: z.string().min(1, 'Account holder name is required'),
  account_no: z.string().regex(/^[0-9]{10}$/, 'Account number must be 10 digits'),
  account_name: z.string().min(1, 'Account name is required'),
  bank_code: z.string().min(1, 'Please select a bank'),
});

type FormData = z.infer<typeof formSchema>;

interface AddSettlementBankModalProps {
  onAddSettlementBank: (data: CreateSettlementBankRequest) => Promise<void>;
}

export function AddSettlementBankModal({ onAddSettlementBank }: AddSettlementBankModalProps) {
  const [open, setOpen] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingAccount, setFetchingAccount] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const lastLookupKey = useRef<string>('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      account_no: '',
      account_name: '',
      bank_code: '',
    },
  });

  // Fetch banks when modal opens
  useEffect(() => {
    if (open && banks.length === 0) {
      fetchBanks();
    }
  }, [open, banks.length]);

  useEffect(() => {
    if (!open) {
      setBankSearch('');
    }
  }, [open]);

  const accountNumber = form.watch('account_no');
  const bankCode = form.watch('bank_code');
  const accountName = form.watch('account_name');

  const slugifyBank = (value?: string) =>
    (value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const filteredBanks = useMemo(() => {
    const term = bankSearch.trim().toLowerCase();
    if (!term) return banks;
    return banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(term) ||
        bank.code.toLowerCase().includes(term)
    );
  }, [bankSearch, banks]);

  useEffect(() => {
    if (accountNumber?.length === 10 && bankCode) {
      const lookupKey = `${bankCode}-${accountNumber}`;
      if (lookupKey === lastLookupKey.current) {
        return;
      }

      const timeoutId = setTimeout(() => {
        lastLookupKey.current = lookupKey;
        verifyAccountName(bankCode, accountNumber);
      }, 300);

      return () => clearTimeout(timeoutId);
    }

    lastLookupKey.current = '';
    form.setValue('account_name', '', { shouldValidate: true });
    form.setValue('name', '', { shouldValidate: true });
    form.clearErrors(['account_no', 'account_name']);
  }, [accountNumber, bankCode, form]);

  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const banksData = await bankService.getBanks();
      setBanks(banksData);
    } catch (error) {
      notify.error('Failed to load banks. Please try again.');
      console.error('Error fetching banks:', error);
    } finally {
      setLoadingBanks(false);
    }
  };

  const verifyAccountName = async (selectedBankCode: string, accountNo: string) => {
    setFetchingAccount(true);
    try {
      const account = await bankService.fetchAccount({
        bank_code: selectedBankCode,
        account_number: accountNo,
      });

      const accountName = account.account_name || account.bank_name || '';
      if (!accountName) {
        throw new Error('Account name not found for the provided details');
      }

      // Skip stale responses if the user has changed the input mid-flight
      const lookupKey = `${selectedBankCode}-${accountNo}`;
      if (lastLookupKey.current !== lookupKey) {
        return;
      }

      form.clearErrors(['account_no', 'account_name']);
      form.setValue('account_name', accountName, { shouldValidate: true });
      form.setValue('name', accountName, { shouldValidate: true });
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch account name. Please check the details.';
      if (`${selectedBankCode}-${accountNo}` !== lastLookupKey.current) {
        return;
      }
      lastLookupKey.current = '';
      form.setValue('account_name', '', { shouldValidate: true });
      form.setValue('name', '', { shouldValidate: true });
      form.setError('account_name', { type: 'manual', message });
      notify.error(message);
    } finally {
      setFetchingAccount(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      // Find the selected bank to get the slug
      const selectedBank = banks.find(bank => bank.code === data.bank_code);
      if (!selectedBank) {
        throw new Error('Selected bank not found');
      }
      if (!data.account_name) {
        throw new Error('Please fetch account details before submitting');
      }
      const bankSlug = selectedBank.slug || slugifyBank(selectedBank.name);
      if (!bankSlug) {
        throw new Error('Unable to determine bank slug for selected bank');
      }

      const settlementBankData: CreateSettlementBankRequest = {
        name: data.name,
        account_no: data.account_no,
        account_name: data.account_name,
        bank_code: data.bank_code,
        bank_slug: bankSlug,
      };

      await onAddSettlementBank(settlementBankData);
      
      // Reset form and close modal on success
      form.reset();
      setOpen(false);
      notify.success('Settlement bank added successfully');
    } catch (error) {
      console.error('Error adding settlement bank:', error);
      notify.error('Failed to add settlement bank. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          Add Settlement Bank
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Settlement Bank</DialogTitle>
          <DialogDescription>
            Add a new bank account for settlement transactions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="account_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234567890"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="off"
                      {...field}
                      onChange={(event) => {
                        const value = event.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bank_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingBanks ? "Loading banks..." : "Select a bank"} />
                      </SelectTrigger>
                    </FormControl>
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
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="ml-2">Loading banks...</span>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Account name will auto-fill"
                        readOnly
                        aria-readonly="true"
                        {...field}
                      />
                      {fetchingAccount && (
                        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || loadingBanks || fetchingAccount || !accountName}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Add Settlement Bank
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
