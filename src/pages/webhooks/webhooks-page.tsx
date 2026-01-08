import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardHeading, CardTable } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Toolbar, ToolbarHeading } from "@/layouts/demo1/components/toolbar";
import { notify } from "@/lib/notifications";
import { webHooksService } from "@/services/webhooks.service";
import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable } from "@tanstack/react-table";
import { EllipsisVertical, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { WebHook } from "@/types/webhooks.types";
import { useNavigate } from "react-router";


export function WebhooksPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<WebHook[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'webhook_name', desc: false }]);
    const navigate = useNavigate()

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await webHooksService.getWebHooks();
            // console.log(response,"Res");
            setData(response);
        } catch (err: any) {
            setError(err);
            notify.error('Failed to load settlement configurations');
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);



    const columns = useMemo<ColumnDef<WebHook>[]>(
        () => [
            {
                accessorKey: 'name',
                id: 'webhook_name',
                header: ({ column }) => <DataGridColumnHeader title="Webhook Name" column={column} />,
                cell: ({ row }) => (
                    <span className="font-medium text-nowrap">
                        {row.original.name ?? 'Unnamed Webhook'}
                    </span>
                ),
                size: 200,
            },
            {
                accessorKey: 'url',
                id: 'webhook_url',
                header: ({ column }) => <DataGridColumnHeader title="Webhook URL" column={column} />,
                cell: ({ row }) => <span className="text-muted-foreground">{row.original.url}</span>,
                size: 300,
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

                            <DropdownMenuItem onClick={() => {
                                navigate(`/webhooks/log/${row.original.id}`)
                            }}>
                                View Logs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
                size: 80,
            }
        ],
        []
    );

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
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No webhooks configured yet</h3>
            </div>
        );
    };

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            globalFilter: searchQuery
        },
        onSortingChange: setSorting,
        onGlobalFilterChange: setSearchQuery,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 15 }
        }
    });


    return (
        <Fragment>
            <Container>
                <Toolbar>
                    <ToolbarHeading
                        title="Webhooks"
                        description="Manage your webhook configurations."
                    />
                </Toolbar>
            </Container>

            <Container>
                {

                    loading ? (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Loader2 className="animate-spin size-8 text-primary mb-4" />
                                <p className="text-muted-foreground">Fetching webhooks...</p>
                            </div>
                        </Card>
                    ) :
                        !loading && !error && (data?.length === 0) ? (
                            <Card>
                                <CardHeader>
                                    <CardHeading>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            {/* Search */}
                                            <div className="relative">
                                                <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                                                <Input
                                                    placeholder="Search"
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
                        )
                            : error ? (
                                <Card>
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <p className="text-destructive font-medium">Error loading data</p>
                                        <Button onClick={fetchData} variant="outline" className="mt-4">Retry</Button>
                                    </div>
                                </Card>
                            ) : (
                                <DataGrid
                                    table={table}
                                    recordCount={data.length}
                                    tableLayout={{ cellBorder: true, rowBorder: true }}
                                >
                                    <Card>
                                        <CardHeader>
                                            <CardHeading>
                                                <div className="relative">
                                                    <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                                                    <Input
                                                        placeholder="Filter results..."
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        className="ps-9 w-64"
                                                    />
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
    )
}