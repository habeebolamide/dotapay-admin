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
import { Customer, CreateCustomerRequest } from '@/types/customer.types';
import { sampleCustomers } from '@/data/customers';
import { AddCustomerModal } from './components/add-customer-modal';
import { PermissionGate } from '@/components/auth/permission-gate';
import { usePaginatedData } from '@/hooks/use-paginated-data';
import { customersService } from '@/services/customers.service';
import { notify } from '@/lib/notifications';

const StatusIndicator = ({ status }: { status: Customer['status'] }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-2 h-2 rounded-full ${
          status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
    </div>
  );
};

export function CustomersPage() {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('all-time');

  const fetchCustomers = useCallback(async (params: any) => {
    return customersService.getCustomers(params);
  }, []);

  const {
    data: customers,
    pagination: paginationData,
    loading,
    error,
    refetch,
    setPage,
    setPerPage,
    setParams,
  } = usePaginatedData({
    fetchFn: fetchCustomers,
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

  // Use customers directly since API handles filtering and pagination
  const filteredData = customers || [];

  console.log('Customers state:', customers);
  console.log('Filtered data:', filteredData);
  console.log('Loading:', loading);
  console.log('Error:', error);

  const statusCounts = useMemo(() => {
    if (!customers || customers.length === 0) {
      return {} as Record<string, number>;
    }
    return customers.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [customers]);

  const handleStatusChange = (checked: boolean, value: string) => {
    setSelectedStatuses((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleAddCustomer = async (customerData: CreateCustomerRequest) => {
    try {
      await customersService.createCustomer(customerData);
      refetch();
      // Small delay to allow refetch to complete before showing success
      setTimeout(() => {
        notify.info('Customer list refreshed', {
          duration: 2000,
        });
      }, 500);
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  };

  const handleExport = () => {
    // Implement CSV export logic
    console.log('Exporting customers to CSV...', filteredData);
  };

  const handleCustomerClick = (customer: Customer) => {
    console.log('Customer clicked:', customer);
    navigate(`/customers/${customer.id}`);
  };

  const columns = useMemo<ColumnDef<Customer>[]>(
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
        id: 'email',
        accessorFn: (row) => row.email,
        header: ({ column }) => (
          <DataGridColumnHeader title="Customer Email" column={column} />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.email}</span>
        ),
        enableSorting: true,
        size: 250,
      },
      {
        id: 'fullName',
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        header: ({ column }) => (
          <DataGridColumnHeader title="Full Name" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {`${row.original.first_name} ${row.original.last_name}` || 'No Name'}
          </span>
        ),
        enableSorting: true,
        size: 200,
      },
      {
        id: 'phone',
        accessorFn: (row) => row.phone,
        header: ({ column }) => (
          <DataGridColumnHeader title="Phone" column={column} />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.phone || 'No Phone Number'}
          </span>
        ),
        enableSorting: false,
        size: 150,
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
    getRowId: (row: Customer) => String(row.id),
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
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No customers</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          There are no customers for this query. Please try another query or clear your filters.
        </p>
      </div>
    );
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Customers"
            description={`${paginationData.total || 0} customers`}
          />
          <ToolbarActions>
            <PermissionGate permission="tenant.customers.store">
              <AddCustomerModal onAddCustomer={handleAddCustomer} />
            </PermissionGate>
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} />
              Export CSV
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        {!loading && !error && (filteredData?.length === 0 || !customers) ? (
          <Card>
            <CardHeader>
              <CardHeading>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Filters */}
                  <Button variant="outline">
                    <Filter size={16} />
                    Filters
                    <ChevronDown size={16} />
                  </Button>

                  {/* Search */}
                  <div className="relative">
                    <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search Email"
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
                <p className="mt-4 text-muted-foreground">Loading customers...</p>
              </div>
            </div>
          </Card>
        ) : error ? (
          <Card>
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <p className="text-red-600 font-medium">Error loading customers</p>
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
            onRowClick={handleCustomerClick}
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
                    {/* Filters */}
                    <Button variant="outline">
                      <Filter size={16} />
                      Filters
                      <ChevronDown size={16} />
                    </Button>

                    {/* Search */}
                    <div className="relative">
                      <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                      <Input
                        placeholder="Search Email"
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
