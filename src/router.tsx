'use client';

import { Fragment, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Download,
  Filter,
  Search,
  X,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
} from '@/layouts/demo1/components/toolbar';
import { SettlementBank, CreateSettlementBankRequest } from '@/types/settlement-bank.types';
// import { AddSettlementBankModal } from './components/add-settlement-bank-modal';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import { settlementBanksService } from '@/services/settlement-banks.service';
import { notify } from '@/lib/notifications';
import { SettlementBankDetailPage } from '@/pages/settlement-banks/settlement-bank-detail-page';
import { AddSettlementBankModal } from './pages/settlement-banks/components/add-settlement-bank-modal';

export function SettlementBanksPage() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSettlementBanks = useCallback(async (params: any) => {
    return settlementBanksService.getSettlementBanks(params);
  }, []);

  const {
    data: settlementBanks,
    pagination: paginationData,
    loading,
    error,
    refetch,
    setPage,
    setPerPage,
    setParams,
  } = usePaginatedData({
    fetchFn: fetchSettlementBanks,
    initialParams: {
      page: 1,
      per_page: 15,
    },
  });

  // Handle search changes with debounce (skip initial render)
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

  // Create pagination state for react-table from API data
  const pagination = useMemo<PaginationState>(() => ({
    pageIndex: (paginationData.current_page || 1) - 1,
    pageSize: paginationData.per_page || 15,
  }), [paginationData.current_page, paginationData.per_page]);

  const handlePaginationChange = useCallback((updater: any) => {
    if (typeof updater === 'function') {
      const newState = updater(pagination);
      if (newState.pageIndex !== pagination.pageIndex) {
        setPage(newState.pageIndex + 1);
      }
      if (newState.pageSize !== pagination.pageSize) {
        setPerPage(newState.pageSize);
      }
    }
  }, [pagination, setPage, setPerPage]);

  // Use settlement banks directly since API handles filtering and pagination
  const filteredData = settlementBanks || [];

  console.log('Settlement banks state:', settlementBanks);
  console.log('Filtered data:', filteredData);
  console.log('Loading:', loading);
  console.log('Error:', error);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleAddSettlementBank = async (settlementBankData: CreateSettlementBankRequest) => {
    try {
      await settlementBanksService.createSettlementBank(settlementBankData);
      refetch();
      // Small delay to allow refetch to complete before showing success
      setTimeout(() => {
        notify.info('Settlement banks list refreshed', {
          duration: 2000,
        });
      }, 500);
    } catch (error) {
      console.error('Failed to create settlement bank:', error);
      throw error;
    }
  };

  const handleExport = () => {
    // Implement CSV export logic
    console.log('Exporting settlement banks to CSV...', filteredData);
  };

  const handleSettlementBankClick = (settlementBank: SettlementBank) => {
    console.log('Settlement bank clicked:', settlementBank);
    navigate(`/settlement-banks/${settlementBank.id}`);
  };

  const columns = useMemo<ColumnDef<SettlementBank>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => row.name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Account Holder" column={column} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
        enableSorting: true,
        size: 200,
      },
      {
        id: 'account_name',
        accessorFn: (row) => row.account_name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Account Name" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.account_name}</span>
        ),
        enableSorting: true,
        size: 200,
      },
      {
        id: 'account_no',
        accessorFn: (row) => row.account_no,
        header: ({ column }) => (
          <DataGridColumnHeader title="Account Number" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground font-mono">
            {row.original.account_no}
          </span>
        ),
        enableSorting: false,
        size: 150,
      },
      {
        id: 'bank_slug',
        accessorFn: (row) => row.bank_slug,
        header: ({ column }) => (
          <DataGridColumnHeader title="Bank" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm capitalize">
            {row.original.bank_slug.replace(/-/g, ' ')}
          </span>
        ),
        enableSorting: true,
        size: 150,
      },
      {
        id: 'bank_code',
        accessorFn: (row) => row.bank_code,
        header: ({ column }) => (
          <DataGridColumnHeader title="Bank Code" column={column} />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.bank_code}
          </Badge>
        ),
        enableSorting: true,
        size: 100,
      },
      {
        id: 'created_at',
        accessorFn: (row) => row.created_at,
        header: ({ column }) => (
          <DataGridColumnHeader title="Added On" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.created_at)}</span>
        ),
        enableSorting: true,
        size: 120,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: paginationData.last_page,
    getRowId: (row: SettlementBank) => String(row.id),
    state: {
      pagination,
      sorting,
    },
    columnResizeMode: 'onChange',
    onPaginationChange: handlePaginationChange,
    manualPagination: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const EmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-muted-foreground/30 rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No settlement banks</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          There are no settlement banks for this query. Please try another query or clear your filters.
        </p>
      </div>
    );
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Settlement Banks"
            description={`${paginationData.total || 0} settlement banks`}
          />
          <ToolbarActions>
            <AddSettlementBankModal onAddSettlementBank={handleAddSettlementBank} />
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} />
              Export CSV
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        {!loading && !error && (filteredData?.length === 0 || !settlementBanks) ? (
          <Card>
            <CardHeader>
              <CardHeading>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search Account Holder or Bank"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-9 w-64"
                    />
                    {searchQuery.length > 0 && (
                      <Button
                        mode="icon"
                        variant="ghost"
                        className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchQuery('')}
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeading>
            </CardHeader>
            <EmptyState />
          </Card>
        ) : loading ? (
          <Card>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                <p className="mt-4 text-muted-foreground">Loading settlement banks...</p>
              </div>
            </div>
          </Card>
        ) : error ? (
          <Card>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-red-600 font-medium">Error loading settlement banks</p>
                <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
                <Button onClick={refetch} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <DataGrid
            table={table}
            recordCount={paginationData.total || 0}
            onRowClick={handleSettlementBankClick}
            tableLayout={{
              columnsPinnable: false,
              columnsMovable: false,
              columnsVisibility: false,
              cellBorder: true,
              rowBorder: true,
            }}
          >
            <Card>
              <CardHeader>
                <CardHeading>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                      <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="Search Account Holder or Bank"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-9 w-64"
                      />
                      {searchQuery.length > 0 && (
                        <Button
                          mode="icon"
                          variant="ghost"
                          className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                          onClick={() => setSearchQuery('')}
                        >
                          <X />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeading>
              </CardHeader>
              <CardTable>
                <ScrollArea>
                  <DataGridTable />
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </CardTable>
              <CardFooter>
                <DataGridPagination />
              </CardFooter>
            </Card>
          </DataGrid>
        )}
      </Container>
    </Fragment>
  );
}

