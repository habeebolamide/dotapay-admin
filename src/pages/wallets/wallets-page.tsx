'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { X, Wallet as WalletIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { PageNavbar } from '@/pages/account';
import { useSettings } from '@/providers/settings-provider';
import { CreateWalletRequest, UpdateWalletRequest, Wallet } from '@/types/wallet.types';
import { walletService } from '@/services/wallet.service';
import { notify } from '@/lib/notifications';
import { WalletCard } from '@/components/ui/wallet-card';
import { EditWalletModal } from './components/edit-wallet-modal';
import { CreateWalletModal } from './components/create-wallet-modal';
import { PermissionGate } from '@/components/auth/permission-gate';

export function WalletsPage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    last: 1,
    perPage: 20,
    total: 0,
    from: 0,
    to: 0,
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [savingWallet, setSavingWallet] = useState(false);
  const [deletingWalletSlug, setDeletingWalletSlug] = useState<string | null>(null);

  const fetchWallets = useCallback(async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      const response = await walletService.getBusinessWallets({ page: pageNumber });
      setWallets(response.data);
      setFilteredWallets(response.data);
      
      // Handle both formats: top-level pagination or nested in meta object
      const meta = (response as any).meta || response;
      setPagination({
        current: meta.current_page ?? pageNumber,
        last: meta.last_page ?? 1,
        perPage: meta.per_page ?? 20,
        total: meta.total ?? response.data.length,
        from: meta.from ?? 0,
        to: meta.to ?? response.data.length,
      });
      setPage(meta.current_page ?? pageNumber);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
      notify.error('Failed to load wallets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallets(page);
  }, [page]);

  useEffect(() => {
    let filtered = wallets;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(wallet =>
        wallet.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(wallet => {
        const type = getWalletType(wallet.slug);
        return type.toLowerCase() === selectedType.toLowerCase();
      });
    }

    setFilteredWallets(filtered);
  }, [wallets, searchQuery, selectedType]);

  const getWalletType = (slug: string) => {
    if (slug.startsWith('provider-')) return 'Provider';
    if (slug.includes('_demo')) return 'Demo';
    return 'Standard';
  };

  const getWalletTypes = () => {
    const types = wallets.map(wallet => getWalletType(wallet.slug));
    return ['all', ...Array.from(new Set(types))];
  };

  const canGoPrev = page > 1;
  const canGoNext = page < pagination.last;
  const showingFrom = pagination.from || (filteredWallets.length ? (page - 1) * pagination.perPage + 1 : 0);
  const showingTo = pagination.to || ((page - 1) * pagination.perPage + filteredWallets.length);
  const totalCount = pagination.total || filteredWallets.length;

  const handleCreateWallet = async (data: CreateWalletRequest) => {
    try {
      await walletService.createWallet(data);
      await fetchWallets(1);
      notify.success('Wallet created successfully');
    } catch (error) {
      console.error('Failed to create wallet:', error);
      notify.error('Failed to create wallet');
      throw error;
    }
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    notify.success('Wallet ID copied to clipboard');
  };

  const handleWalletSettings = (wallet: Wallet) => {
    console.log('Open wallet settings for:', wallet);
    // TODO: Implement wallet settings
  };

  const handleWalletClick = (wallet: Wallet) => {
    navigate(`/wallets/${wallet.slug}`, {
      state: { wallet },
    });
  };

  const handleOpenEditModal = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingWallet(null);
  };

  const handleUpdateWallet = async (data: UpdateWalletRequest) => {
    if (!editingWallet) return;

    setSavingWallet(true);
    try {
      await walletService.updateWallet(editingWallet.slug, data);
      notify.updateSuccess('Wallet');
      handleCloseEditModal();
      await fetchWallets(page);
    } catch (error) {
      console.error('Failed to update wallet:', error);
      notify.updateError('Wallet');
      throw error;
    } finally {
      setSavingWallet(false);
    }
  };

  const handleDeleteWallet = async (wallet: Wallet) => {
    if (deletingWalletSlug) return;

    const confirmation = await Swal.fire({
      title: 'Delete wallet?',
      text: `Are you sure you want to delete "${wallet.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      confirmButtonColor: '#ef4444',
    });

    if (!confirmation.isConfirmed) return;

    try {
      setDeletingWalletSlug(wallet.slug);
      const nextPage = filteredWallets.length === 1 && page > 1 ? page - 1 : page;
      await walletService.deleteWallet(wallet.slug);
      notify.deleteSuccess('Wallet');
      await fetchWallets(nextPage);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      notify.deleteError('Wallet');
    } finally {
      setDeletingWalletSlug(null);
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (canGoPrev) {
      setPage((prev) => Math.max(1, prev - 1));
    }
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-4 flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-muted-foreground/30 rounded-lg flex items-center justify-center">
            <WalletIcon className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-muted-foreground/60" />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">No wallets found</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
        {searchQuery || selectedType !== 'all'
          ? 'No wallets match your current filters. Try adjusting your search or filters.'
          : 'Create your first wallet to get started with managing your finances.'
        }
      </p>
      {!searchQuery && selectedType === 'all' && (
        <PermissionGate permission="tenant.businesses.wallets.create">
          <CreateWalletModal onCreateWallet={handleCreateWallet} />
        </PermissionGate>
      )}
    </div>
  );

  const NoWalletsState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 mb-4 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-muted-foreground/30 rounded-lg flex items-center justify-center">
          <WalletIcon className="w-6 h-6 text-muted-foreground/50" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-muted-foreground mb-2">No wallets yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
        Create your first wallet to start managing your business finances
      </p>
      <PermissionGate permission="tenant.businesses.wallets.create">
        <CreateWalletModal onCreateWallet={handleCreateWallet} />
      </PermissionGate>
    </div>
  );

  return (
    <Fragment>
      <PageNavbar />
      {settings?.layout === 'demo1' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text="Wallets" />
              <ToolbarDescription>
                Manage your business wallets and view balances
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <PermissionGate permission="tenant.businesses.wallets.create">
                <CreateWalletModal onCreateWallet={handleCreateWallet} />
              </PermissionGate>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <div className="space-y-6">
          

          {/* Wallets Content */}
          {loading ? (
            <Card>
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-4 text-muted-foreground">Loading wallets...</p>
                </div>
              </div>
            </Card>
          ) : wallets.length === 0 ? (
            <Card>
              <NoWalletsState />
            </Card>
          ) : filteredWallets.length === 0 ? (
            <Card>
              <EmptyState />
            </Card>
          ) : (
            <Fragment>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWallets.map((wallet) => (
                  <WalletCard
                    key={wallet.slug}
                    wallet={wallet}
                    onCopy={handleCopySlug}
                    onSettings={handleWalletSettings}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteWallet}
                    onClick={handleWalletClick}
                  />
                ))}
              </div>

              <div className="flex flex-col gap-2 rounded-lg border bg-background/50 px-4 py-3 md:flex-row md:items-center md:justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {showingFrom}–{showingTo} of {totalCount} wallets
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={!canGoPrev}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.current} of {pagination.last}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!canGoNext}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Fragment>
          )}
        </div>
      </Container>
      <EditWalletModal
        wallet={editingWallet}
        open={editModalOpen}
        loading={savingWallet}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateWallet}
      />
    </Fragment>
  );
}
