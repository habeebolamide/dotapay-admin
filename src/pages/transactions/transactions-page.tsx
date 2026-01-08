'use client';

import { Fragment, useMemo, useState } from 'react';
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
  Calendar,
  ChevronDown,
  Download,
  Filter,
  Search,
  X,
  CreditCard
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
  CardToolbar,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataGrid, useDataGrid } from '@/components/ui/data-grid';
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
import { Transaction } from '@/types/transaction.types';
import { sampleTransactions } from '@/data/transactions';
import { exportToCSV, generateExportFilename } from '@/utils/export';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { usePaymentList } from '@/hooks/use-payments';
import type { PaymentTransaction } from '@/services/types/payment.types';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'Success':
        return 'success';
      case 'FAILED':
      case 'Failed':
        return 'destructive';
      case 'PENDING':
      case 'Pending':
        return 'warning';
      case 'CANCELLED':
      case 'Abandoned':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge size="sm" variant={getStatusColor(status) as any} appearance="default">
      {status}
    </Badge>
  );
};

const ChannelBadge = ({ channel }: { channel: string }) => {
  return (
    <Badge size="sm" variant="outline">
      {channel}
    </Badge>
  );
};

export function TransactionsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('all-time');

  // Fetch payments from API
  const { data: paymentListResponse, isLoading, error } = usePaymentList({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });

  const apiPayments = useMemo(() => {
    if (!paymentListResponse?.data?.data) return [];
    return paymentListResponse.data.data;
  }, [paymentListResponse]);

  const filteredData = useMemo(() => {
    let filtered = apiPayments;

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((item) => selectedStatuses.includes(item.status));
    }

    // Filter by channel
    if (selectedChannels.length > 0) {
      filtered = filtered.filter((item) => selectedChannels.includes(item.virtual_account_provider));
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.reference.toLowerCase().includes(searchLower) ||
          item.request_data.customer_name.toLowerCase().includes(searchLower) ||
          item.request_data.customer_email.toLowerCase().includes(searchLower) ||
          item.virtual_account_provider.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    const now = new Date();
    if (dateRange !== 'all-time') {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.created_at);
        switch (dateRange) {
          case 'today':
            return itemDate.toDateString() === now.toDateString();
          case 'last-7-days':
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return itemDate >= sevenDaysAgo;
          case 'this-month':
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
          case 'last-month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            return itemDate.getMonth() === lastMonth.getMonth() && itemDate.getFullYear() === lastMonth.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [apiPayments, searchQuery, selectedStatuses, selectedChannels, dateRange]);

  const statusCounts = useMemo(() => {
    return apiPayments.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [apiPayments]);

  const channelCounts = useMemo(() => {
    return apiPayments.reduce(
      (acc, item) => {
        acc[item.virtual_account_provider] = (acc[item.virtual_account_provider] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [apiPayments]);

  const handleStatusChange = (checked: boolean, value: string) => {
    setSelectedStatuses((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  const handleChannelChange = (checked: boolean, value: string) => {
    setSelectedChannels((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP p');
  };

  const columns = useMemo<ColumnDef<PaymentTransaction>[]>(
    () => [
      {
        id: 'amount',
        accessorFn: (row) => row.total_amount,
        header: ({ column }) => (
          <DataGridColumnHeader title="Amount" column={column} />
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {formatAmount(row.original.total_amount)}
          </div>
        ),
        enableSorting: true,
        size: 120,
      },
      {
        id: 'customer',
        accessorFn: (row) => row.request_data.customer_name,
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.request_data.customer_name}</span>
            <span className="text-sm text-muted-foreground">
              {row.original.request_data.customer_email}
            </span>
          </div>
        ),
        enableSorting: true,
        size: 250,
      },
      {
        id: 'reference',
        accessorFn: (row) => row.reference,
        header: ({ column }) => (
          <DataGridColumnHeader title="Reference" column={column} />
        ),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.reference}</span>
        ),
        enableSorting: true,
        size: 180,
      },
      {
        id: 'channel',
        accessorFn: (row) => row.virtual_account_provider,
        header: ({ column }) => (
          <DataGridColumnHeader title="Channel" column={column} />
        ),
        cell: ({ row }) => <ChannelBadge channel={row.original.virtual_account_provider} />,
        enableSorting: true,
        size: 130,
      },
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'date',
        accessorFn: (row) => row.created_at,
        header: ({ column }) => (
          <DataGridColumnHeader title="Date" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.created_at)}</span>
        ),
        enableSorting: true,
        size: 200,
      },
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((paymentListResponse?.data?.total || filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: PaymentTransaction) => row.id.toString(),
    state: {
      pagination,
      sorting,
    },
    columnResizeMode: 'onChange',
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleExport = () => {
    const filename = generateExportFilename({
      dateRange,
      status: selectedStatuses,
      channel: selectedChannels,
    });
    exportToCSV(filteredData, filename);
  };

  const TableToolbar = () => {
    return (
      <CardToolbar>
        <Button variant="outline" onClick={handleExport}>
          <Download size={16} />
          Export CSV
        </Button>
      </CardToolbar>
    );
  };

  const EmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-muted-foreground/30 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No transactions</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          There are no transactions for this query. Please try another query or clear your filters.
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-destructive">Error loading transactions</p>
            <p className="mt-2 text-muted-foreground text-sm">Please try again later</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Transactions"
            description={`${filteredData.length} of ${paymentListResponse?.data?.total || 0} transactions`}
          />
          <ToolbarActions>
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} />
              Export CSV
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        {filteredData.length === 0 ? (
          <Card>
            <CardHeader>
              <CardHeading>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Search */}
                  <div className="relative">
                    <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search reference, customer ID or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-9 w-72"
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

                  {/* Status Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter size={16} />
                        Status
                        {selectedStatuses.length > 0 && (
                          <Badge size="sm" variant="outline">
                            {selectedStatuses.length}
                          </Badge>
                        )}
                        <ChevronDown size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="start">
                      <div className="space-y-3">
                        <div className="text-xs font-medium text-muted-foreground">
                          Status
                        </div>
                        <div className="space-y-3">
                          {Object.keys(statusCounts).map((status) => (
                            <div key={status} className="flex items-center gap-2.5">
                              <Checkbox
                                id={status}
                                checked={selectedStatuses.includes(status)}
                                onCheckedChange={(checked) =>
                                  handleStatusChange(checked === true, status)
                                }
                              />
                              <Label
                                htmlFor={status}
                                className="grow flex items-center justify-between font-normal gap-1.5"
                              >
                                {status}
                                <span className="text-muted-foreground">
                                  {statusCounts[status]}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Channel Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter size={16} />
                        Channel
                        {selectedChannels.length > 0 && (
                          <Badge size="sm" variant="outline">
                            {selectedChannels.length}
                          </Badge>
                        )}
                        <ChevronDown size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="start">
                      <div className="space-y-3">
                        <div className="text-xs font-medium text-muted-foreground">
                          Channel
                        </div>
                        <div className="space-y-3">
                          {Object.keys(channelCounts).map((channel) => (
                            <div key={channel} className="flex items-center gap-2.5">
                              <Checkbox
                                id={channel}
                                checked={selectedChannels.includes(channel)}
                                onCheckedChange={(checked) =>
                                  handleChannelChange(checked === true, channel)
                                }
                              />
                              <Label
                                htmlFor={channel}
                                className="grow flex items-center justify-between font-normal gap-1.5"
                              >
                                {channel}
                                <span className="text-muted-foreground">
                                  {channelCounts[channel]}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Date Range Filter */}
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-40">
                      <Calendar size={16} />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-time">All time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="last-7-days">Last 7 days</SelectItem>
                      <SelectItem value="this-month">This month</SelectItem>
                      <SelectItem value="last-month">Last month</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeading>
            </CardHeader>
            <EmptyState />
          </Card>
        ) : (
          <DataGrid
            table={table}
            recordCount={filteredData?.length || 0}
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
                        placeholder="Search reference, customer ID or email"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-9 w-72"
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

                    {/* Status Filter */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Filter size={16} />
                          Status
                          {selectedStatuses.length > 0 && (
                            <Badge size="sm" variant="outline">
                              {selectedStatuses.length}
                            </Badge>
                          )}
                          <ChevronDown size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3" align="start">
                        <div className="space-y-3">
                          <div className="text-xs font-medium text-muted-foreground">
                            Status
                          </div>
                          <div className="space-y-3">
                            {Object.keys(statusCounts).map((status) => (
                              <div key={status} className="flex items-center gap-2.5">
                                <Checkbox
                                  id={status}
                                  checked={selectedStatuses.includes(status)}
                                  onCheckedChange={(checked) =>
                                    handleStatusChange(checked === true, status)
                                  }
                                />
                                <Label
                                  htmlFor={status}
                                  className="grow flex items-center justify-between font-normal gap-1.5"
                                >
                                  {status}
                                  <span className="text-muted-foreground">
                                    {statusCounts[status]}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Channel Filter */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Filter size={16} />
                          Channel
                          {selectedChannels.length > 0 && (
                            <Badge size="sm" variant="outline">
                              {selectedChannels.length}
                            </Badge>
                          )}
                          <ChevronDown size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3" align="start">
                        <div className="space-y-3">
                          <div className="text-xs font-medium text-muted-foreground">
                            Channel
                          </div>
                          <div className="space-y-3">
                            {Object.keys(channelCounts).map((channel) => (
                              <div key={channel} className="flex items-center gap-2.5">
                                <Checkbox
                                  id={channel}
                                  checked={selectedChannels.includes(channel)}
                                  onCheckedChange={(checked) =>
                                    handleChannelChange(checked === true, channel)
                                  }
                                />
                                <Label
                                  htmlFor={channel}
                                  className="grow flex items-center justify-between font-normal gap-1.5"
                                >
                                  {channel}
                                  <span className="text-muted-foreground">
                                    {channelCounts[channel]}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Date Range Filter */}
                    <Select value={dateRange} onValueChange={setDateRange}>
                      <SelectTrigger className="w-40">
                        <Calendar size={16} />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-time">All time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="last-7-days">Last 7 days</SelectItem>
                        <SelectItem value="this-month">This month</SelectItem>
                        <SelectItem value="last-month">Last month</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
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