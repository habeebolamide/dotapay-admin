'use client';

import { Fragment, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Copy,
  Loader2,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Wallet as WalletIcon,
} from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Wallet,
  WalletTransaction,
  WalletTransactionsResponse,
} from '@/types/wallet.types';
import { walletService } from '@/services/wallet.service';
import { notify } from '@/lib/notifications';
import { cn } from '@/lib/utils';
import { settlementBanksService } from '@/services/settlement-banks.service';
import { SettlementBank } from '@/types/settlement-bank.types';

const TRANSACTIONS_PER_PAGE = 10;

interface LocationState {
  wallet?: Wallet;
}

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 2,
});

const parseTransactionMeta = (meta: WalletTransaction['meta']) => {
  if (!meta) return {};
  if (typeof meta === 'string') {
    try {
      return JSON.parse(meta);
    } catch (error) {
      console.warn('Failed to parse transaction meta:', error);
      return {};
    }
  }
  return meta;
};

const getTransactionTypeBadge = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized === 'deposit') return { label: 'Deposit', variant: 'success' as const };
  if (normalized === 'withdraw' || normalized === 'withdrawal') {
    return { label: 'Withdrawal', variant: 'warning' as const };
  }
  return { label: type, variant: 'secondary' as const };
};

const getAmountAppearance = (amount: number) => {
  if (amount > 0) {
    return { icon: <TrendingUp className="h-4 w-4 text-emerald-400" />, className: 'text-emerald-400' };
  }
  if (amount < 0) {
    return { icon: <TrendingDown className="h-4 w-4 text-red-400" />, className: 'text-red-400' };
  }
  return { icon: null, className: 'text-muted-foreground' };
};

export function WalletDetailPage() {
  const navigate = useNavigate();
  const { walletSlug } = useParams<{ walletSlug: string }>();
  const location = useLocation();
  const { wallet: locationWallet } = (location.state as LocationState) || {};

  const [wallet, setWallet] = useState<Wallet | null>(locationWallet ?? null);
  const [walletLoading, setWalletLoading] = useState(!locationWallet);
  const [walletError, setWalletError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsMeta, setTransactionsMeta] = useState<WalletTransactionsResponse['meta'] | null>(null);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [settlementBanks, setSettlementBanks] = useState<SettlementBank[]>([]);
  const [settlementBanksLoading, setSettlementBanksLoading] = useState(false);
  const [settlementBanksError, setSettlementBanksError] = useState<string | null>(null);
  const [selectedSettlementBank, setSelectedSettlementBank] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  useEffect(() => {
    if (!walletSlug) {
      navigate('/wallets');
    }
  }, [walletSlug, navigate]);

  const formatWalletName = useCallback((slug: string) => {
    if (slug.startsWith('provider-')) {
      return 'Provider Wallet';
    }
    if (slug.includes('_demo')) {
      const parts = slug.split('_');
      if (parts[1] === 'BIZ') {
        return 'BIZ Demo';
      }
      return `${parts[1]} ${parts[2]}`;
    }
    if (slug.startsWith('WALLET_DEMO_')) {
      const code = slug.replace('WALLET_DEMO_', '');
      return `DEMO ${code}`;
    }
    return slug.replace(/WALLET_|_/g, ' ').trim();
  }, []);

  const fetchWalletDetails = useCallback(async () => {
    if (!walletSlug) return;

    try {
      setWalletLoading(true);
      setWalletError(null);

      const response = await walletService.getBusinessWallets({
        page: 1,
        per_page: 100,
      });

      let matchedWallet = response.data.find((item) => item.slug === walletSlug);

      if (!matchedWallet && response.last_page > 1) {
        for (let nextPage = 2; nextPage <= response.last_page; nextPage += 1) {
          const pageResponse = await walletService.getBusinessWallets({
            page: nextPage,
            per_page: 100,
          });

          matchedWallet = pageResponse.data.find((item) => item.slug === walletSlug);
          if (matchedWallet) {
            break;
          }

          if (pageResponse.data.length === 0) {
            break;
          }
        }
      }

      if (!matchedWallet) {
        setWalletError('Wallet details could not be found.');
        notify.loadError('wallet details');
        return;
      }

      setWallet(matchedWallet);
    } catch (error: any) {
      const message = error?.message || 'Failed to load wallet details.';
      setWalletError(message);
      notify.loadError('wallet details');
      console.error('Failed to fetch wallet details:', error);
    } finally {
      setWalletLoading(false);
    }
  }, [walletSlug]);

  const fetchTransactions = useCallback(
    async (pageToLoad: number) => {
      if (!walletSlug) return;

      try {
        setTransactionsLoading(true);
        setTransactionsError(null);

        const response = await walletService.getWalletTransactions(walletSlug, {
          page: pageToLoad,
          per_page: TRANSACTIONS_PER_PAGE,
        });

        setTransactions(response.data);
        setTransactionsMeta(response.meta);
      } catch (error: any) {
        const message = error?.message || 'Failed to load wallet transactions.';
        setTransactionsError(message);
        notify.loadError('wallet transactions');
        console.error('Failed to fetch wallet transactions:', error);
      } finally {
        setTransactionsLoading(false);
      }
    },
    [walletSlug]
  );

  const loadSettlementBanks = useCallback(async () => {
    try {
      setSettlementBanksLoading(true);
      setSettlementBanksError(null);
      const response = await settlementBanksService.getSettlementBanks({
        page: 1,
        per_page: 100,
      });
      setSettlementBanks(response.data);
    } catch (error: any) {
      const message = error?.message || 'Failed to load settlement banks.';
      setSettlementBanksError(message);
      notify.loadError('settlement banks');
      console.error('Failed to fetch settlement banks:', error);
    } finally {
      setSettlementBanksLoading(false);
    }
  }, []);

  const resetWithdrawForm = useCallback(() => {
    setWithdrawAmount('');
    setSelectedSettlementBank('');
  }, []);

  const handleWithdrawModalChange = useCallback(
    (open: boolean) => {
      setWithdrawModalOpen(open);
      if (!open) {
        resetWithdrawForm();
        setSettlementBanksError(null);
      }
    },
    [resetWithdrawForm]
  );

  useEffect(() => {
    if (walletSlug) {
      fetchWalletDetails();
    }
  }, [walletSlug, fetchWalletDetails]);

  useEffect(() => {
    fetchTransactions(page);
  }, [fetchTransactions, page]);

  useEffect(() => {
    if (isWithdrawModalOpen && !settlementBanksLoading && settlementBanks.length === 0) {
      loadSettlementBanks();
    }
  }, [isWithdrawModalOpen, settlementBanksLoading, settlementBanks.length, loadSettlementBanks]);

  const handleBack = () => {
    navigate('/wallets');
  };

  const handleCopySlug = async () => {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet.slug);
      notify.copySuccess('Wallet ID');
    } catch (error) {
      notify.copyError();
      console.error('Failed to copy wallet slug:', error);
    }
  };

  const handleRefreshWallet = async () => {
    await fetchWalletDetails();
  };

  const handleRefreshTransactions = async () => {
    setPage(1);
    await fetchTransactions(1);
  };

  const handleWithdrawClick = () => {
    setWithdrawModalOpen(true);
  };

  const handleWithdrawSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!wallet) return;

    const trimmedAmount = withdrawAmount.trim();
    if (!trimmedAmount) {
      notify.warning('Enter a withdrawal amount');
      return;
    }

    const numericAmount = Number(trimmedAmount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      notify.warning('Amount must be greater than zero');
      return;
    }

    if (!selectedSettlementBank) {
      notify.warning('Select a settlement bank');
      return;
    }

    try {
      setWithdrawLoading(true);
      const response = await walletService.withdrawFromWallet({
        wallet_id: wallet.slug,
        amount: trimmedAmount,
        settlement_bank_id: selectedSettlementBank,
      });

      if (response?.success === false) {
        const message = response?.message || 'Failed to submit withdrawal request.';
        notify.error(message);
        return;
      }

      notify.success('Withdrawal request submitted');
      handleWithdrawModalChange(false);
      await fetchWalletDetails();
      const targetPage = 1;
      const shouldFetchImmediately = page === targetPage;
      setPage(targetPage);
      if (shouldFetchImmediately) {
        await fetchTransactions(targetPage);
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to submit withdrawal request.';
      notify.error(message);
      console.error('Wallet withdrawal failed:', error);
    } finally {
      setWithdrawLoading(false);
    }
  };

  const formattedBalance = useMemo(() => {
    if (!wallet) return currencyFormatter.format(0);
    const numericBalance = parseFloat(wallet.balance ?? wallet.balance ?? '0');
    return currencyFormatter.format(numericBalance);
  }, [wallet])

  const walletCreatedAt = wallet ? format(new Date(wallet.created_at), 'MMM d, yyyy • h:mm a') : null;

  const canGoPrevious = transactionsMeta?.current_page && transactionsMeta.current_page > 1;
  const canGoNext =
    transactionsMeta?.current_page && transactionsMeta?.last_page
      ? transactionsMeta.current_page < transactionsMeta.last_page
      : false;

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text={wallet ? formatWalletName(wallet.name) : 'Wallet Details'} />
            <ToolbarDescription>
              View wallet balance information and recent transactions
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button onClick={handleWithdrawClick} disabled={walletLoading || withdrawLoading || !wallet}>
              {withdrawLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TrendingDown className="mr-2 h-4 w-4" />
              )}
              Withdraw
            </Button>
            <Button variant="outline" onClick={handleRefreshWallet} disabled={walletLoading}>
              {walletLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
              Refresh
            </Button>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Wallets
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardHeading>
                <CardTitle>Wallet Overview</CardTitle>
              </CardHeading>
            </CardHeader>
            <CardContent>
              {walletLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading wallet details...</span>
                </div>
              ) : walletError ? (
                <div className="text-center space-y-3">
                  <p className="text-destructive font-medium">Unable to load wallet details.</p>
                  <p className="text-sm text-muted-foreground">{walletError}</p>
                  <Button size="sm" onClick={handleRefreshWallet}>
                    Retry
                  </Button>
                </div>
              ) : wallet ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <WalletIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wallet balance</p>
                      <p className="text-2xl font-semibold text-mono">{formattedBalance}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Wallet ID</p>
                    <div className="flex items-center gap-2">
                      <code className="select-all rounded-md bg-muted px-2 py-1 text-xs">{wallet.slug}</code>
                      <Button size="icon-sm" variant="ghost" onClick={handleCopySlug}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Created on</p>
                    <p className="text-sm">{walletCreatedAt}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  Wallet information is unavailable.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardHeading>
                <div className="flex flex-col gap-1">
                  <CardTitle>Wallet Transactions</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Track deposits and withdrawals associated with this wallet.
                  </p>
                </div>
              </CardHeading>
              <ToolbarActions>
                <Button variant="ghost" size="sm" onClick={handleRefreshTransactions} disabled={transactionsLoading}>
                  {transactionsLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="mr-2 h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </ToolbarActions>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">Loading transactions...</p>
                  </div>
                </div>
              ) : transactionsError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <p className="text-destructive font-medium">Unable to load transactions.</p>
                  <p className="text-sm text-muted-foreground">{transactionsError}</p>
                  <Button size="sm" onClick={handleRefreshTransactions}>
                    Retry
                  </Button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <WalletIcon className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Deposits and withdrawals will appear here once they are available.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-36">Date</TableHead>
                        <TableHead className="w-32">Type</TableHead>
                        <TableHead className="w-32 text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => {
                        const meta = parseTransactionMeta(transaction.meta);
                        const description =
                          meta?.description ||
                          meta?.transaction_code ||
                          meta?.funding_ref ||
                          '—';
                        const amountValue =
                          typeof transaction.amount === 'string'
                            ? parseFloat(transaction.amount)
                            : transaction.amount ?? 0;
                        const amountAppearance = getAmountAppearance(amountValue);
                        const formattedAmount = currencyFormatter.format(Math.abs(amountValue));
                        const typeBadge = getTransactionTypeBadge(transaction.type);
                        const isConfirmed =
                          typeof transaction.confirmed === 'boolean'
                            ? transaction.confirmed
                            : Boolean(Number(transaction.confirmed));

                        return (
                          <TableRow key={transaction.id}>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(transaction.created_at), 'MMM d, yyyy • h:mm a')}
                            </TableCell>
                            <TableCell>
                              <Badge size="sm" variant={typeBadge.variant}>
                                {typeBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell className={cn('text-right font-medium text-mono', amountAppearance.className)}>
                              <div className="flex items-center justify-end gap-1.5">
                                {amountAppearance.icon}
                                <span>{amountValue < 0 ? `-${formattedAmount}` : formattedAmount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge size="sm" variant={isConfirmed ? 'success' : 'secondary'}>
                                {isConfirmed ? 'Confirmed' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[240px]">
                              <div className="flex flex-col gap-1">
                                <span className="truncate text-sm">{description}</span>
                                {meta?.account_name && (
                                  <span className="text-xs text-muted-foreground">
                                    {meta.account_name} • {meta.account_no ?? meta.sender_account_bank}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            {!transactionsLoading && transactions.length > 0 && transactionsMeta && (
              <CardFooter className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {transactionsMeta.current_page} of {transactionsMeta.last_page}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={!canGoPrevious}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((prev) => (canGoNext ? prev + 1 : prev))}
                    disabled={!canGoNext}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </Container>

      <Dialog open={isWithdrawModalOpen} onOpenChange={handleWithdrawModalChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Transfer money from this wallet into one of your settlement bank accounts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleWithdrawSubmit}>
            <DialogBody className="space-y-5">
              <div className="rounded-md border border-dashed border-input bg-muted/30 px-3 py-2.5 text-sm">
                <p className="text-muted-foreground">Available balance</p>
                <p className="text-lg font-semibold text-mono">{formattedBalance}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdraw-amount">Amount (NGN)</Label>
                <Input
                  id="withdraw-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount to withdraw"
                  value={withdrawAmount}
                  onChange={(event) => setWithdrawAmount(event.target.value)}
                  disabled={withdrawLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select settlement bank</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={loadSettlementBanks}
                    disabled={settlementBanksLoading}
                  >
                    {settlementBanksLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="mr-2 h-4 w-4" />
                    )}
                    Refresh
                  </Button>
                </div>

                {settlementBanksLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : settlementBanksError ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <p>{settlementBanksError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={loadSettlementBanks}
                    >
                      Try again
                    </Button>
                  </div>
                ) : settlementBanks.length === 0 ? (
                  <div className="rounded-md border border-dashed border-input px-3 py-4 text-sm text-muted-foreground">
                    No settlement banks found. Add one in Settings to make a withdrawal.
                  </div>
                ) : (
                  <Select
                    value={selectedSettlementBank}
                    onValueChange={setSelectedSettlementBank}
                    disabled={withdrawLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose settlement bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {settlementBanks.map((bank) => (
                        <SelectItem key={bank.code} value={bank.code}>
                          {bank.name} • {bank.account_no} ({bank.bank_slug.replace(/-/g, ' ')})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </DialogBody>
            <DialogFooter className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleWithdrawModalChange(false)}
                disabled={withdrawLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  withdrawLoading ||
                  settlementBanks.length === 0 ||
                  !!settlementBanksError
                }
              >
                {withdrawLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TrendingDown className="mr-2 h-4 w-4" />
                )}
                Confirm Withdrawal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
