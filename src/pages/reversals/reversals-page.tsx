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
  Download,
  Filter,
  Search,
  X,
  ChevronDown,
  Calendar,
  RotateCcw,
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
import { Reversal } from '@/types/reversal.types';
import { sampleReversals } from '@/data/reversals';

const StatusBadge = ({ status }: { status: Reversal['status'] }) => {
  const getStatusColor = (status: Reversal['status']) => {
    switch (status) {
      case 'processed':
        return 'success';
      case 'processing':
        return 'warning';
      case 'failed':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: Reversal['status']) => {
    switch (status) {
      case 'processed':
        return 'Processed';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  return (
    <Badge size="sm" variant={getStatusColor(status) as any} appearance="default">
      {getStatusText(status)}
    </Badge>
  );
};

const StatusIndicator = ({ status }: { status: Reversal['status'] }) => {
  const getStatusColor = (status: Reversal['status']) => {
    switch (status) {
      case 'processed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
    </div>
  );
};

export function ReversalsPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'refundedOn', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [refundAmountOperator, setRefundAmountOperator] = useState<string>('more-than');
  const [refundAmountValue, setRefundAmountValue] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredData = useMemo(() => {
    let filtered = sampleReversals;

    // Filter by status
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((item) => selectedStatuses.includes(item.status));
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.customerEmail.toLowerCase().includes(searchLower) ||
          item.customerName.toLowerCase().includes(searchLower) ||
          item.id.toLowerCase().includes(searchLower)
      );
    }

    // Filter by refund amount
    if (refundAmountValue) {
      const amount = parseFloat(refundAmountValue);
      if (!isNaN(amount)) {
        filtered = filtered.filter((item) => {
          switch (refundAmountOperator) {
            case 'more-than':
              return item.refundAmount > amount;
            case 'less-than':
              return item.refundAmount < amount;
            case 'equal-to':
              return item.refundAmount === amount;
            default:
              return true;
          }
        });
      }
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.refundedOn);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && itemDate < start) return false;
        if (end && itemDate > end) return false;
        return true;
      });
    }

    return filtered;
  }, [searchQuery, selectedStatuses, refundAmountOperator, refundAmountValue, startDate, endDate]);

  const statusCounts = useMemo(() => {
    return sampleReversals.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, []);

  const handleStatusChange = (checked: boolean, value: string) => {
    setSelectedStatuses((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleExport = () => {
    console.log('Exporting reversals to CSV...', filteredData);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedStatuses([]);
    setRefundAmountOperator('more-than');
    setRefundAmountValue('');
    setStartDate('');
    setEndDate('');
  };

  const handleFilter = () => {
    setFiltersOpen(false);
  };

  const columns = useMemo<ColumnDef<Reversal>[]>(
    () => [
      {
        id: 'status',
        accessorFn: (row) => row.status,
        header: '',
        cell: ({ row }) => <StatusIndicator status={row.original.status} />,
        enableSorting: false,
        size: 20,
      },
      {
        id: 'refundAmount',
        accessorFn: (row) => row.refundAmount,
        header: ({ column }) => (
          <DataGridColumnHeader title="Refund Amount" column={column} />
        ),
        cell: ({ row }) => (
          <div className="font-medium">
            {formatAmount(row.original.refundAmount, row.original.currency)}
          </div>
        ),
        enableSorting: true,
        size: 150,
      },
      {
        id: 'customerName',
        accessorFn: (row) => row.customerName,
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer Name" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.customerName || '-'}
          </span>
        ),
        enableSorting: true,
        size: 200,
      },
      {
        id: 'customerEmail',
        accessorFn: (row) => row.customerEmail,
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer Email" column={column} />
        ),
        cell: ({ row }) => (
          <span>{row.original.customerEmail}</span>
        ),
        enableSorting: true,
        size: 250,
      },
      {
        id: 'status_badge',
        accessorFn: (row) => row.status,
        header: ({ column }) => (
          <DataGridColumnHeader title="Status" column={column} />
        ),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        enableSorting: true,
        size: 100,
      },
      {
        id: 'refundedOn',
        accessorFn: (row) => row.refundedOn,
        header: ({ column }) => (
          <DataGridColumnHeader title="Refunded On" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.refundedOn)}</span>
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
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: Reversal) => row.id,
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

  const EmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-muted-foreground/30 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No refunds</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          There are no refunds for this query. Please try another query or clear your filters.
        </p>
      </div>
    );
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={`Refunds - ${filteredData.length}`}
            description={`${filteredData.length} refunds`}
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
        {filteredData.length === 0 && !filtersOpen ? (
          <Card>
            <CardHeader>
              <CardHeading>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter size={16} />
                        Filters
                        <ChevronDown size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                      <div className="space-y-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Status</Label>
                          <Select value="show-all">
                            <SelectTrigger>
                              <SelectValue placeholder="Show All" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="show-all">Show All</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="processed">Processed</SelectItem>
                              <SelectItem value="failed">Failed</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Refund Amount Filter */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Refund Amount</Label>
                          <div className="flex gap-2">
                            <Select value={refundAmountOperator} onValueChange={setRefundAmountOperator}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="more-than">More Than</SelectItem>
                                <SelectItem value="less-than">Less Than</SelectItem>
                                <SelectItem value="equal-to">Equal To</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              placeholder="Amount"
                              value={refundAmountValue}
                              onChange={(e) => setRefundAmountValue(e.target.value)}
                              type="number"
                            />
                          </div>
                        </div>

                        {/* Date Filter */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Date</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Start Date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              type="date"
                            />
                            <Input
                              placeholder="End Date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              type="date"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" onClick={handleReset} className="flex-1">
                            Reset
                          </Button>
                          <Button onClick={handleFilter} className="flex-1 bg-green-600 hover:bg-green-700">
                            Filter
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Search */}
                  <div className="relative">
                    <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search bank reference or refund id"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-9 w-80"
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
                    <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Filter size={16} />
                          Filters
                          <ChevronDown size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="start">
                        <div className="space-y-4">
                          {/* Status Filter */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Status</Label>
                            <Select value="show-all">
                              <SelectTrigger>
                                <SelectValue placeholder="Show All" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="show-all">Show All</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="processed">Processed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Refund Amount Filter */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Refund Amount</Label>
                            <div className="flex gap-2">
                              <Select value={refundAmountOperator} onValueChange={setRefundAmountOperator}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="more-than">More Than</SelectItem>
                                  <SelectItem value="less-than">Less Than</SelectItem>
                                  <SelectItem value="equal-to">Equal To</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="Amount"
                                value={refundAmountValue}
                                onChange={(e) => setRefundAmountValue(e.target.value)}
                                type="number"
                              />
                            </div>
                          </div>

                          {/* Date Filter */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Date</Label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Start Date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                type="date"
                              />
                              <Input
                                placeholder="End Date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                type="date"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" onClick={handleReset} className="flex-1">
                              Reset
                            </Button>
                            <Button onClick={handleFilter} className="flex-1 bg-green-600 hover:bg-green-700">
                              Filter
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* Search */}
                    <div className="relative">
                      <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="Search bank reference or refund id"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-9 w-80"
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