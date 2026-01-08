'use client';

import { Fragment, useState, useCallback, useRef, useEffect } from 'react';
import {
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Split,
  Settings,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardHeading,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
} from '@/partials/common/toolbar';
import { PageNavbar } from '@/pages/account';
import { useSettings } from '@/providers/settings-provider';
import { TransactionSplit, CreateSplitGroupRequest, CreateSubAccountRequest } from '@/types/transaction-split.types';
import { SplitGroup, splitGroupsService, CreateSplitGroupRequest as APISplitGroupRequest } from '@/services/split-groups.service';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import { notify } from '@/lib/notifications';
import { NewSplitGroupModal } from './components/new-split-group-modal';
import { NewSubaccountModal } from './components/new-subaccount-modal';
import { WalletSettings } from './components/wallet-settings';

const StatusBadge = ({ status }: { status: TransactionSplit['status'] }) => {
  const getStatusColor = (status: TransactionSplit['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge size="sm" variant={getStatusColor(status) as any} appearance="default">
      {status === 'active' ? 'Active' : 'Inactive'}
    </Badge>
  );
};

export function TransactionSplitsPage() {
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubAccount, setSelectedSubAccount] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSplitType, setSelectedSplitType] = useState<string>('all');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<SplitGroup | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const fetchSplitGroups = useCallback(async (params: any) => {
    return splitGroupsService.getSplitGroups(params);
  }, []);

  const {
    data: splitGroups,
    pagination: paginationData,
    loading,
    error,
    refetch,
    setPage,
    setPerPage,
    setParams,
  } = usePaginatedData({
    fetchFn: fetchSplitGroups,
    initialParams: {
      page: 1,
      per_page: 15,
    },
  });

  // Handle search changes with debounce
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        setParams({ search: searchQuery, page: 1 });
      } else {
        setParams({ search: undefined, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setParams]);

  // Handle filter changes
  useEffect(() => {
    const params: any = { page: 1 };
    if (selectedStatus && selectedStatus !== 'all') {
      params.status = selectedStatus;
    }
    if (selectedSplitType && selectedSplitType !== 'all') {
      params.split_type = selectedSplitType;
    }
    setParams(params);
  }, [selectedStatus, selectedSplitType, setParams]);

  const filteredData = splitGroups || [];

  // Auto-select first split group when data loads
  useEffect(() => {
    if (filteredData.length > 0 && !selectedSplit) {
      setSelectedSplit(filteredData[0]);
    }
  }, [filteredData, selectedSplit]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleCreateSplitGroup = async (data: CreateSplitGroupRequest) => {
    try {
      const apiData: APISplitGroupRequest = {
        name: data.name,
        split_type: data.splitType,
      };
      const newSplit = await splitGroupsService.createSplitGroup(apiData);
      refetch();
      setSelectedSplit(newSplit);
      notify.success('Split group created successfully');
    } catch (error) {
      console.error('Failed to create split group:', error);
      notify.error('Failed to create split group');
      throw error;
    }
  };

  const handleUpdateSplitGroup = async (id: number, data: CreateSplitGroupRequest) => {
    try {
      const apiData: Partial<APISplitGroupRequest> = {
        name: data.name,
        split_type: data.splitType,
      };
      const updatedSplit = await splitGroupsService.updateSplitGroup(id, apiData);
      refetch();
      setSelectedSplit(updatedSplit);
      notify.success('Split group updated successfully');
    } catch (error) {
      console.error('Failed to update split group:', error);
      notify.error('Failed to update split group');
      throw error;
    }
  };

  const handleCreateSubaccount = async (data: CreateSubAccountRequest) => {
    // TODO: Implement subaccount creation API
    console.log('Creating subaccount:', data);
    notify.info('Subaccount creation not yet implemented');
  };

  const handleExport = () => {
    console.log('Exporting transaction splits to CSV...', filteredData);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedSubAccount('');
    setSelectedStatus('all');
    setSelectedSplitType('all');
  };

  const handleFilter = () => {
    setFiltersOpen(false);
  };


  const EmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-muted-foreground/30 rounded-lg flex items-center justify-center">
              <Split className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No split groups yet</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Create your first split group to start splitting transaction payouts across multiple subaccounts
        </p>
      </div>
    );
  };
  return (
    <Fragment>
      <PageNavbar />
      {settings?.layout === 'demo1' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle text="Transaction Splits" />
              <ToolbarDescription>
                Split transaction payouts across multiple subaccounts
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <NewSplitGroupModal onCreateSplitGroup={handleCreateSplitGroup} />
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        {splitGroups.length === 0 && !loading ? (
          <Card>
            <EmptyState />
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Filters and Search Bar */}
            <div className="flex items-center gap-3 bg-background p-4 rounded-lg border">
              <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter size={16} />
                    Filter
                    <ChevronDown size={16} />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filter Transaction Splits</DialogTitle>
                  </DialogHeader>
                  <DialogBody>
                    <div className="space-y-4">
                      {/* Subaccount Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Subaccount</Label>
                        <Select value={selectedSubAccount} onValueChange={setSelectedSubAccount}>
                          <SelectTrigger>
                            <SelectValue placeholder="Search" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All</SelectItem>
                            <SelectItem value="ogegbo">OGEGBO, CHRISTOPHER</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Split Type Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Split type</Label>
                        <Select value={selectedSplitType} onValueChange={setSelectedSplitType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">✓ All</SelectItem>
                            <SelectItem value="percentage">Percentage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Category Filter */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Category</Label>
                        <Select value="all">
                          <SelectTrigger>
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                      Reset
                    </Button>
                    <Button onClick={handleFilter} className="flex-1 bg-green-600 hover:bg-green-700">
                      Filter
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Search */}
              <div className="relative flex-1">
                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                <Input
                  placeholder="Search split groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 w-full"
                  size="sm"
                />
                {searchQuery.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchQuery('')}
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>

              {filteredData.length > 0 && (
                <Badge variant="secondary">
                  {paginationData.total || filteredData.length} split groups
                </Badge>
              )}
            </div>

            {/* Split Groups Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-16 border rounded-lg">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-4 text-muted-foreground">Loading split groups...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-16 border rounded-lg">
                <div className="text-center">
                  <p className="text-red-600 font-medium">Error loading split groups</p>
                  <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
                  <Button onClick={refetch} className="mt-4">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex items-center justify-center py-16 border rounded-lg">
                <div className="text-center">
                  <p className="text-muted-foreground">No split groups found</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredData.map((split) => (
                    <div
                      key={split.id}
                      className="p-6 border rounded-lg cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all bg-background"
                      onClick={() => {
                        setSelectedSplit(split);
                        setSettingsModalOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{split.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Code: <span className="font-mono">{split.code}</span>
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-muted-foreground mt-1" />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type: </span>
                          <span className="capitalize font-medium">{split.split_type}</span>
                        </div>
                        <div className="text-muted-foreground">•</div>
                        <div>
                          <span className="text-muted-foreground">Created: </span>
                          <span className="font-medium">{formatDate(split.created_at)}</span>
                        </div>
                      </div>
                      {split.settings && split.settings.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <span className="text-xs text-muted-foreground">
                            {split.settings.length} wallet{split.settings.length !== 1 ? 's' : ''} configured
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {paginationData.last_page > 1 && (
                  <div className="flex flex-col gap-2 bg-background/50 px-4 py-3 rounded-lg border md:flex-row md:items-center md:justify-between">
                    <span className="text-sm text-muted-foreground">
                      Showing {paginationData.from}–{paginationData.to} of {paginationData.total} split groups
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(paginationData.current_page - 1)}
                        disabled={!paginationData.prev_page_url}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {paginationData.current_page} of {paginationData.last_page}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(paginationData.current_page + 1)}
                        disabled={!paginationData.next_page_url}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Container>

      {/* Settings Modal */}
      {selectedSplit && (
        <Dialog open={settingsModalOpen} onOpenChange={setSettingsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between pr-8">
                <div>
                  <DialogTitle>{selectedSplit.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Code: <span className="font-mono">{selectedSplit.code}</span> • Type: <span className="capitalize">{selectedSplit.split_type}</span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSettingsModalOpen(false);
                    setEditModalOpen(true);
                  }}
                >
                  <Edit size={16} className="mr-2" />
                  Edit
                </Button>
              </div>
            </DialogHeader>
            <DialogBody>
              <div className="space-y-6">
                {/* Split Info */}
                <div className="grid grid-cols-3 gap-6 pb-4 border-b">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Split type</div>
                    <div className="capitalize font-medium">{selectedSplit.split_type}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Code</div>
                    <div className="font-mono font-medium">{selectedSplit.code}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Created</div>
                    <div className="font-medium">{formatDate(selectedSplit.created_at)}</div>
                  </div>
                </div>

                {/* Wallet Settings */}
                <WalletSettings splitGroup={selectedSplit} />
              </div>
            </DialogBody>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Modal */}
      <NewSplitGroupModal
        onCreateSplitGroup={handleCreateSplitGroup}
        onUpdateSplitGroup={handleUpdateSplitGroup}
        splitGroup={selectedSplit}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />
    </Fragment>
  );
}