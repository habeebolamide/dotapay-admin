import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardHeading, CardTable } from "@/components/ui/card";
import {
    Toolbar,
    ToolbarActions,
    ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { EllipsisVertical, Search, Loader2, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { AddAutoSettlementConfiguration } from "./components/add-auto-settlement-configuration";
import { autoSettlementBanksService } from "@/services/autosettlement-banks.service";
import {
    ColumnDef,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable
} from "@tanstack/react-table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { DataGridTable } from "@/components/ui/data-grid-table";
import { DataGridPagination } from "@/components/ui/data-grid-pagination";
import { DataGrid } from "@/components/ui/data-grid";
import { Input } from "@/components/ui/input";
import { DataGridColumnHeader } from "@/components/ui/data-grid-column-header";
import { formatKoboToNaira } from "@/lib/helpers";
import { AutoSettlement, CreateAutoSettlementConfigurationRequest } from "@/types/autosettlement-bank.types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { notify } from "@/lib/notifications";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EditAutoSettlementConfiguration } from "./components/edit-auto-settlement-configuration";
import { useNavigate } from 'react-router-dom';

export function AutoSettlementListPage() {
    // Data State
    const [data, setData] = useState<AutoSettlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [sorting, setSorting] = useState<SortingState>([{ id: 'wallet_name', desc: false }]);
    const [itemToDelete, setItemToDelete] = useState<AutoSettlement | null>(null);
    const [itemToEdit, setItemToEdit] = useState<AutoSettlement | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    const navigate = useNavigate();
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await autoSettlementBanksService.getAutoSettlements();
            setData(Array.isArray(response) ? response : response.data || []);
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

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await autoSettlementBanksService.deleteAutoSettlement(itemToDelete.id);
            notify.success('Configuration removed');
            fetchData();
            setItemToDelete(null);
        } catch (err) {
            notify.error('Failed to delete');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleAddSuccess = async (newData: CreateAutoSettlementConfigurationRequest) => {
        try {
            await autoSettlementBanksService.createAutoSettlementConfig(newData);
            fetchData();
            notify.success('Configuration added');
        } catch (err) { throw err; }
    };

    const handleEditSuccess = async (updatedData: CreateAutoSettlementConfigurationRequest) => {
        if (!itemToEdit) return;
        try {
            await autoSettlementBanksService.updateAutoSettlement(itemToEdit.id, updatedData);
            fetchData();
            setItemToEdit(null);
            notify.success('Configuration updated');
        } catch (err) { throw err; }
    };

    const columns = useMemo<ColumnDef<AutoSettlement>[]>(
        () => [
            {
                accessorKey: 'wallet_slug',
                id: 'wallet_name',
                header: ({ column }) => <DataGridColumnHeader title="Wallet Name" column={column} />,
                cell: ({ row }) => <span className="font-medium">{row.original.wallet.name}</span>,
                size: 200,
            },
            {
                accessorKey: 'code',
                id: 'settlement_bank_name',
                header: ({ column }) => <DataGridColumnHeader title="Settlement Bank" column={column} />,
                cell: ({ row }) => <span>{row.original.settlement_bank.name}</span>,
                size: 200,
            },
            {
                accessorKey: 'minimum_amount_kobo',
                id: 'minimum_threshold',
                header: ({ column }) => <DataGridColumnHeader title="Minimum Threshold" column={column} />,
                cell: ({ row }) => <span>{(row.original.minimum)}</span>,
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
                            <DropdownMenuItem onClick={() => {
                                // Navigate to detail view
                                navigate(`/auto-settlement/${row.original.id}`);
                            }}>
                                View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setItemToEdit(row.original)}>
                                Edit Config
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => setItemToDelete(row.original)}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
                size: 80,
            },
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
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No Auto Settlements</h3>
                <AddAutoSettlementConfiguration onAddAutoSettlement={handleAddSuccess} />
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
        getPaginationRowModel: getPaginationRowModel(), // Client-side pagination
        initialState: {
            pagination: { pageSize: 15 }
        }
    });

    return (
        <Fragment>
            <Container>
                <Toolbar>
                    <ToolbarHeading
                        title="Auto Settlement List"
                        description={`${data.length} total configurations`}
                    />
                    <ToolbarActions>
                        <AddAutoSettlementConfiguration onAddAutoSettlement={handleAddSuccess} />
                    </ToolbarActions>
                </Toolbar>
            </Container>

            <Container>
                {

                    loading ? (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Loader2 className="animate-spin size-8 text-primary mb-4" />
                                <p className="text-muted-foreground">Fetching configurations...</p>
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

            {/* Deletion Dialog */}
            <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <DialogBody>
                        Delete auto-settlement for <strong>{itemToDelete?.wallet.name}</strong>?
                    </DialogBody>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting && <Loader2 className="animate-spin size-4 mr-2" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {itemToEdit && (
                <EditAutoSettlementConfiguration
                    isOpen={!!itemToEdit}
                    onClose={() => setItemToEdit(null)}
                    onEditAutoSettlement={handleEditSuccess}
                    autosettleMent={itemToEdit}
                />
            )}
        </Fragment>
    );
}