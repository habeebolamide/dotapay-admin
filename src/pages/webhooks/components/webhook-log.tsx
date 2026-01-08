import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { usePaginatedData } from "@/hooks/use-paginated-data";
import { Toolbar, ToolbarActions, ToolbarHeading } from "@/layouts/demo1/components/toolbar";
import { notify } from "@/lib/notifications";
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, PaginationState, SortingState, useReactTable } from "@tanstack/react-table";
import { ArrowLeft, EllipsisVertical, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Fragment } from "react/jsx-runtime";
import {
    CardFooter,
    CardHeader,
    CardHeading,
    CardTable,
} from '@/components/ui/card';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { Input } from "@/components/ui/input";
import { WebhookLog } from "@/types/webhooks.types";
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header";
import { formatDateTime, formatKoboToNaira, useDebounce } from "@/lib/helpers";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { webHooksService } from "@/services/webhooks.service";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";


export function WebhookLogsPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [itemToRetry, setItemToRetry] = useState<WebhookLog | null>(null);
    const [isRetrying, setIsRetrying] = useState(false)
    const [sorting, setSorting] = useState<SortingState>([
        { id: 'created_at', desc: true },
    ]);

    const fetchWebhookLogs = useCallback(async (params: any) => {
        return webHooksService.getWebhookLogs(id!, params);
    }, [id]);



    const {
        data: webhooklog,
        pagination: paginationData,
        loading,
        error,
        refetch,
        setPage,
        setPerPage,
        setParams,
    } = usePaginatedData({
        fetchFn: fetchWebhookLogs,
        initialParams: {
            page: 1,
            per_page: 15,
        },
    });

    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        setParams((prev: any) => ({
            ...prev,
            search: debouncedSearch,
            page: 1, 
        }));
    }, [debouncedSearch, setParams]);


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


    const filteredData = webhooklog || [];

    const retryWebhookLog = async () => {
        if (!itemToRetry?.id) {
            notify.error("No log selected to retry");
            return;
        }

        try {
            setIsRetrying(true);
            await webHooksService.retryWebhookLog(itemToRetry.id);

            refetch();
            notify.success('Webhook retry initiated successfully');
            setItemToRetry(null);
        } catch (err: any) {
            notify.error(err.message || "Failed to retry webhook");
        } finally {
            setIsRetrying(false);
        }
    };


    const columns = useMemo<ColumnDef<WebhookLog>[]>(
        () => [
            {
                accessorKey: 'amount_paid',
                id: 'amount_paid',
                header: ({ column }) => <DataGridColumnHeader title="Amount Paid" column={column} />,
                cell: ({ row }) => (
                    <span className="font-medium text-nowrap">
                        {formatKoboToNaira(row.original.payload.amountPaid)}
                    </span>
                ),
                size: 200,
            },

            {
                accessorKey: 'settlementAmount',
                id: 'settlement_amount',
                header: ({ column }) => <DataGridColumnHeader title="Settlement Amount" column={column} />,
                cell: ({ row }) => (
                    <span className="font-medium text-nowrap">
                        {formatKoboToNaira(row.original.payload.settlementAmount)}
                    </span>
                ),
                size: 200,
            },

            {
                accessorKey: 'payload',
                id: 'payload',
                header: ({ column }) => <DataGridColumnHeader title="Payload" column={column} />,
                cell: ({ row }) => {
                    const payload = row.original.payload;
                    return (
                        <div className="flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 text-xs">
                                        View JSON
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-[400px] p-4">
                                    <div className="text-xs font-mono bg-muted p-3 rounded-md max-h-[300px] overflow-auto">
                                        <pre>{JSON.stringify(payload, null, 2)}</pre>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    );
                },
                size: 150,
            },

            {
                accessorKey: 'httpcode',
                id: 'httpcode',
                header: ({ column }) => <DataGridColumnHeader title="Http Code" column={column} />,
                cell: ({ row }) => (
                    <span className="font-medium text-nowrap">
                        {row.original.http_code}
                    </span>
                ),
                size: 200,
            },

            {
                accessorKey: 'date',
                id: 'data',
                header: ({ column }) => <DataGridColumnHeader title="Date" column={column} />,
                cell: ({ row }) => (
                    <span className="font-medium text-nowrap">
                        {formatDateTime(row.original.created_at)}
                    </span>
                ),
                size: 200,
            },

            {
                id: 'actions',
                header: "Actions",
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="size-7" mode="icon" variant="ghost">
                                <EllipsisVertical size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end">
                            <DropdownMenuItem onClick={() => setItemToRetry(row.original)}>
                                Retry
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
                size: 80,
            },

        ],
        []
    );

    const table = useReactTable({
        columns,
        data: filteredData,
        pageCount: paginationData.last_page,
        getRowId: (row: WebhookLog) => String(row.id),
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

    if (loading) {
        return (
            <Fragment>
                <Container>
                    <Toolbar>
                        <ToolbarHeading title="Settlement Bank Details" description="Loading..." />
                    </Toolbar>
                </Container>
                <Container>
                    <Card>
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="animate-spin size-8 text-primary mb-4" />
                            <p className="text-muted-foreground">Loading details...</p>
                        </div>
                    </Card>
                </Container>
            </Fragment>
        );
    }

    if (error) {
        return (
            <Fragment>
                <Container>
                    <Toolbar>
                        <ToolbarHeading title="Error" description="Failed to load data" />
                        <ToolbarActions>
                            <Button variant="outline" onClick={() => navigate('/webhooks')}>
                                <ArrowLeft size={16} />
                                Back to Webhook List
                            </Button>
                        </ToolbarActions>
                    </Toolbar>
                </Container>
                <Container>
                    <Card>
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-destructive font-medium">Something went wrong</p>
                            <p className="text-sm text-muted-foreground mb-4">{error?.message || 'Item not found'}</p>
                        </div>
                    </Card>
                </Container>
            </Fragment>
        );
    }

    return (
        <Fragment>
            <Container>
                <Toolbar>
                    <ToolbarHeading
                        title={"Webhook Log"}
                        description="Auto Settlement Configuration Details"
                    />
                    <ToolbarActions>
                        <Button variant="outline" onClick={() => navigate('/webhooks')}>
                            <ArrowLeft size={16} />
                            Back to Webhook List
                        </Button>
                    </ToolbarActions>
                </Toolbar>
            </Container>

            <Container>
                <DataGrid
                    table={table}
                    recordCount={paginationData.total || 0}
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
            </Container>


            {/* Confirmation Dialog */}
            <Dialog open={!!itemToRetry} onOpenChange={(open) => !open && setItemToRetry(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Operation</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        Are you sure you want to carry out this operation
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="primary" onClick={retryWebhookLog} disabled={isRetrying}>
                            {isRetrying && <Loader2 className="animate-spin size-4 mr-2" />}
                            Retry
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </Fragment>
    )
}