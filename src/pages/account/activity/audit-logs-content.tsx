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
  Activity
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
import { useAuditLogList } from '@/hooks/use-payments';
import type { AuditLog } from '@/types/audit-log.types';
import { exportToCSV, generateExportFilename } from '@/utils/export';

const EventBadge = ({ event }: { event: string | null }) => {
  if (!event) return <Badge size="sm" variant="secondary">default</Badge>;

  const getEventColor = (event: string) => {
    switch (event.toLowerCase()) {
      case 'created':
        return 'success';
      case 'updated':
        return 'info';
      case 'deleted':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge size="sm" variant={getEventColor(event) as any} appearance="default">
      {event}
    </Badge>
  );
};

export function AuditLogsContent() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 15,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogNames, setSelectedLogNames] = useState<string[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<string>('all-time');

  // Fetch audit logs from API
  const { data: auditLogResponse, isLoading, error } = useAuditLogList({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  });

  const apiLogs = useMemo(() => {
    if (!auditLogResponse?.data?.data) return [];
    return auditLogResponse.data.data;
  }, [auditLogResponse]);

  const filteredData = useMemo(() => {
    let filtered = apiLogs;

    // Filter by log name
    if (selectedLogNames.length > 0) {
      filtered = filtered.filter((item) => selectedLogNames.includes(item.log_name));
    }

    // Filter by event
    if (selectedEvents.length > 0) {
      filtered = filtered.filter((item) =>
        item.event && selectedEvents.includes(item.event)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.description.toLowerCase().includes(searchLower) ||
          item.log_name.toLowerCase().includes(searchLower) ||
          (item.event && item.event.toLowerCase().includes(searchLower))
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
  }, [apiLogs, searchQuery, selectedLogNames, selectedEvents, dateRange]);

  const logNameCounts = useMemo(() => {
    return apiLogs.reduce(
      (acc, item) => {
        acc[item.log_name] = (acc[item.log_name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [apiLogs]);

  const eventCounts = useMemo(() => {
    return apiLogs.reduce(
      (acc, item) => {
        if (item.event) {
          acc[item.event] = (acc[item.event] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );
  }, [apiLogs]);

  const handleLogNameChange = (checked: boolean, value: string) => {
    setSelectedLogNames((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  const handleEventChange = (checked: boolean, value: string) => {
    setSelectedEvents((prev) =>
      checked ? [...prev, value] : prev.filter((v) => v !== value)
    );
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP p');
  };

  const columns = useMemo<ColumnDef<AuditLog>[]>(
    () => [
      {
        id: 'description',
        accessorFn: (row) => row.description,
        header: ({ column }) => (
          <DataGridColumnHeader title="Description" column={column} />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.description}</span>
            {row.original.properties.type && (
              <span className="text-sm text-muted-foreground">
                Type: {row.original.properties.type}
              </span>
            )}
          </div>
        ),
        enableSorting: true,
        size: 350,
      },
      // {
      //   id: 'log_name',
      //   accessorFn: (row) => row.log_name,
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Log Name" column={column} />
      //   ),
      //   cell: ({ row }) => (
      //     <Badge size="sm" variant="outline">{row.original.log_name}</Badge>
      //   ),
      //   enableSorting: true,
      //   size: 130,
      // },
      // {
      //   id: 'event',
      //   accessorFn: (row) => row.event || 'N/A',
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Event" column={column} />
      //   ),
      //   cell: ({ row }) => <EventBadge event={row.original.event} />,
      //   enableSorting: true,
      //   size: 120,
      // },
      // {
      //   id: 'causer',
      //   accessorFn: (row) => row.causer_id,
      //   header: ({ column }) => (
      //     <DataGridColumnHeader title="Causer ID" column={column} />
      //   ),
      //   cell: ({ row }) => (
      //     <span className="text-sm">{row.original.causer_id}</span>
      //   ),
      //   enableSorting: true,
      //   size: 100,
      // },
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
    pageCount: Math.ceil((auditLogResponse?.data?.total || filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row: AuditLog) => row.id.toString(),
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
      prefix: 'audit-logs',
    });
    exportToCSV(filteredData, filename);
  };

  const EmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 mb-4 flex items-center justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-muted-foreground/30 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-muted-foreground/20 rounded-full flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No activity logs</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          There are no activity logs for this query. Please try another query or clear your filters.
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-destructive">Error loading activity logs</p>
          <p className="mt-2 text-muted-foreground text-sm">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      {filteredData.length === 0 ? (
        <Card>
          <CardHeader>
            <CardHeading>
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search description, log name or event"
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

                {/* Log Name Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Filter size={16} />
                      Log Name
                      {selectedLogNames.length > 0 && (
                        <Badge size="sm" variant="outline">
                          {selectedLogNames.length}
                        </Badge>
                      )}
                      <ChevronDown size={16} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3" align="start">
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-muted-foreground">
                        Log Name
                      </div>
                      <div className="space-y-3">
                        {Object.keys(logNameCounts).map((logName) => (
                          <div key={logName} className="flex items-center gap-2.5">
                            <Checkbox
                              id={logName}
                              checked={selectedLogNames.includes(logName)}
                              onCheckedChange={(checked) =>
                                handleLogNameChange(checked === true, logName)
                              }
                            />
                            <Label
                              htmlFor={logName}
                              className="grow flex items-center justify-between font-normal gap-1.5"
                            >
                              {logName}
                              <span className="text-muted-foreground">
                                {logNameCounts[logName]}
                              </span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Event Filter */}
                {Object.keys(eventCounts).length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter size={16} />
                        Event
                        {selectedEvents.length > 0 && (
                          <Badge size="sm" variant="outline">
                            {selectedEvents.length}
                          </Badge>
                        )}
                        <ChevronDown size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="start">
                      <div className="space-y-3">
                        <div className="text-xs font-medium text-muted-foreground">
                          Event
                        </div>
                        <div className="space-y-3">
                          {Object.keys(eventCounts).map((event) => (
                            <div key={event} className="flex items-center gap-2.5">
                              <Checkbox
                                id={event}
                                checked={selectedEvents.includes(event)}
                                onCheckedChange={(checked) =>
                                  handleEventChange(checked === true, event)
                                }
                              />
                              <Label
                                htmlFor={event}
                                className="grow flex items-center justify-between font-normal gap-1.5"
                              >
                                {event}
                                <span className="text-muted-foreground">
                                  {eventCounts[event]}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

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
                  </SelectContent>
                </Select>

                {/* Export Button */}
                <Button variant="outline" onClick={handleExport}>
                  <Download size={16} />
                  Export CSV
                </Button>
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
                      placeholder="Search description, log name or event"
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

                  {/* Log Name Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline">
                        <Filter size={16} />
                        Log Name
                        {selectedLogNames.length > 0 && (
                          <Badge size="sm" variant="outline">
                            {selectedLogNames.length}
                          </Badge>
                        )}
                        <ChevronDown size={16} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="start">
                      <div className="space-y-3">
                        <div className="text-xs font-medium text-muted-foreground">
                          Log Name
                        </div>
                        <div className="space-y-3">
                          {Object.keys(logNameCounts).map((logName) => (
                            <div key={logName} className="flex items-center gap-2.5">
                              <Checkbox
                                id={logName}
                                checked={selectedLogNames.includes(logName)}
                                onCheckedChange={(checked) =>
                                  handleLogNameChange(checked === true, logName)
                                }
                              />
                              <Label
                                htmlFor={logName}
                                className="grow flex items-center justify-between font-normal gap-1.5"
                              >
                                {logName}
                                <span className="text-muted-foreground">
                                  {logNameCounts[logName]}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Event Filter */}
                  {Object.keys(eventCounts).length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Filter size={16} />
                          Event
                          {selectedEvents.length > 0 && (
                            <Badge size="sm" variant="outline">
                              {selectedEvents.length}
                            </Badge>
                          )}
                          <ChevronDown size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-3" align="start">
                        <div className="space-y-3">
                          <div className="text-xs font-medium text-muted-foreground">
                            Event
                          </div>
                          <div className="space-y-3">
                            {Object.keys(eventCounts).map((event) => (
                              <div key={event} className="flex items-center gap-2.5">
                                <Checkbox
                                  id={event}
                                  checked={selectedEvents.includes(event)}
                                  onCheckedChange={(checked) =>
                                    handleEventChange(checked === true, event)
                                  }
                                />
                                <Label
                                  htmlFor={event}
                                  className="grow flex items-center justify-between font-normal gap-1.5"
                                >
                                  {event}
                                  <span className="text-muted-foreground">
                                    {eventCounts[event]}
                                  </span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}

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
                    </SelectContent>
                  </Select>

                  {/* Export Button */}
                  <Button variant="outline" onClick={handleExport}>
                    <Download size={16} />
                    Export CSV
                  </Button>
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
    </Fragment>
  );
}
