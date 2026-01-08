'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, Search, X } from 'lucide-react';
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

import { CreateAutoSettlementConfigurationRequest } from '@/types/autosettlement-bank.types';
import { Wallet } from '@/types/wallet.types';
import { walletService } from '@/services/wallet.service';
import { notify } from '@/lib/notifications';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { settlementBanksService } from '@/services/settlement-banks.service';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import { Input } from '@/components/ui/input';
import { autoSettlementBanksService } from '@/services/autosettlement-banks.service';

const formSchema = z.object({
  wallet_id: z.string().min(1, 'Wallet ID is required'),
  settlement_bank_id: z.string().min(1, 'Settlement bank is required'),
  minimum: z.string()
    .regex(/^\d+$/, 'Minimum must contain only numbers')
    .refine((val) => Number(val) >= 100000, {
      message: 'Minimum amount must be at least 100,000',
    }),
  frequency: z.string().min(1, 'Please select a frequency'),
});

type FormData = z.infer<typeof formSchema>;

interface AddAutoSettlementConfiguration {
  onAddAutoSettlement: (data: CreateAutoSettlementConfigurationRequest) => Promise<void>;
}

export function AddAutoSettlementConfiguration({ onAddAutoSettlement }: AddAutoSettlementConfiguration) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<Wallet[]>([]);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingSettlementBank, setLoadingSettlementBank] = useState(false);
  const [walletSearchQuery, setWalletSearchQuery] = useState('');


  const fetchWallets = useCallback(async (searchQuery = '') => {
    try {
      setLoadingWallet(true);
      const params = searchQuery ? { search: searchQuery } : {};
      const response = await walletService.getBusinessWallets(params);
      setWallets(response.data);
      setFilteredWallets(response.data);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      notify.error('Failed to load wallets');
    } finally {
      setLoadingWallet(false);
    }
  }, []);

  const fetchSettlementBanks = useCallback(async (params: any) => {
    return settlementBanksService.getSettlementBanks(params);
  }, []);

  const {
    data: settlementBanks,
    pagination: paginationData,
    loading: loadingsettlementBanks,
  } = usePaginatedData({
    fetchFn: fetchSettlementBanks,
    initialParams: {
      page: 1,
      per_page: 105,
    },
  });



  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchWallets(walletSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [walletSearchQuery, fetchWallets]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wallet_id: '',
      settlement_bank_id: '',
      minimum: '',
      frequency: '',
    },
  });


  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await onAddAutoSettlement(data);
      notify.success('Auto settlement configuration added successfully');
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to add auto settlement configuration:', error);
      notify.error('Failed to add auto settlement configuration');
    } finally {
      setLoading(false);
    }
  }



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} />
          Add Auto Settlement Configuration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Auto Settlement Configuration</DialogTitle>
          <DialogDescription>
            Add a new auto settlement bank to your account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form} >
          <form 
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="wallet_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingWallet ? "Loading wallets..." : "Select a wallet"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="p-2 border-b bg-background">
                          <div className="relative">
                            <Input
                              placeholder="Search wallets..."
                              value={walletSearchQuery}
                              onChange={(e) => setWalletSearchQuery(e.target.value)}
                              className="h-8 pl-8"
                            />
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            {walletSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setWalletSearchQuery('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                              >
                                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                              </button>
                            )}
                          </div>
                        </div>
                        {loadingWallet ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="ml-2">Loading wallets...</span>
                          </div>
                        ) : filteredWallets.length ? (
                          filteredWallets.map((wallet) => (
                            <SelectItem key={wallet.slug} value={wallet.slug}>
                              {wallet.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            {walletSearchQuery ? 'No wallets match your search' : 'No wallets found'}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settlement_bank_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Settlement Bank</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingSettlementBank ? "Loading settlement banks..." : "Select a settlement bank"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingSettlementBank ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="ml-2">Loading settlement banks...</span>
                          </div>
                        ) : settlementBanks.length ? (
                          settlementBanks.map((sB) => (
                            <SelectItem key={sB.name} value={sB.code}>
                              {sB.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            No settlement banks found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minimum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="10000"
                        aria-readonly="true"
                        {...field}
                      />
                      {/* {fetchingAccount && (
                        <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      )} */}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">
                          Daily
                        </SelectItem>
                        <SelectItem value="hourly">
                          Hourly
                        </SelectItem>
                        <SelectItem value="weekly">
                          Weekly
                        </SelectItem>
                        <SelectItem value="monthly">
                          Monthly
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Add AutoSettlement Configuration
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
