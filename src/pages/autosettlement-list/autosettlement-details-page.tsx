import { Container } from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardHeading } from "@/components/ui/card";
import { notify } from "@/lib/notifications";
import {
    Toolbar,
    ToolbarActions,
    ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { autoSettlementBanksService } from "@/services/autosettlement-banks.service";
import { ArrowLeft, User, Edit2, Loader2, Wallet as WalletIcon, Banknote, Clock, Hash } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { Fragment } from "react";
import { EditAutoSettlementConfiguration } from "./components/edit-auto-settlement-configuration";
import { AutoSettlement, CreateAutoSettlementConfigurationRequest } from "@/types/autosettlement-bank.types";
import { formatKoboToNaira } from "@/lib/helpers";

export function AutoSettlementDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // Data states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [autoSettlement, setAutoSettlement] = useState<AutoSettlement | null>(null);

    // Edit Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchAutoSettlement = useCallback(async (targetId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await autoSettlementBanksService.getAutoSettlementBank(targetId);
            setAutoSettlement(response);
        } catch (err) {
            setError(err as Error);
            notify.error('Failed to load settlement bank details');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchAutoSettlement(id);
        }
    }, [id, fetchAutoSettlement]);

    const handleEditSuccess = async (updatedData: CreateAutoSettlementConfigurationRequest) => {
        if (!id) return;
        try {
            await autoSettlementBanksService.updateAutoSettlement(id, updatedData);
            notify.success('Configuration updated successfully');
            setIsEditModalOpen(false);
            fetchAutoSettlement(id); 
        } catch (err) {
            console.error('Update failed:', err);
            throw err; 
        }
    };

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

    if (error || !autoSettlement) {
        return (
            <Fragment>
                <Container>
                    <Toolbar>
                        <ToolbarHeading title="Error" description="Failed to load data" />
                        <ToolbarActions>
                            <Button variant="outline" onClick={() => navigate('/settlement-banks')}>
                                <ArrowLeft size={16} />
                                Back to List
                            </Button>
                        </ToolbarActions>
                    </Toolbar>
                </Container>
                <Container>
                    <Card>
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-destructive font-medium">Something went wrong</p>
                            <p className="text-sm text-muted-foreground mb-4">{error?.message || 'Item not found'}</p>
                            <Button onClick={() => id && fetchAutoSettlement(id)}>Try Again</Button>
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
                        title={autoSettlement.settlement_bank.name} 
                        description="Auto Settlement Configuration Details"
                    />
                    <ToolbarActions>
                        <Button variant="primary" onClick={() => setIsEditModalOpen(true)}>
                            <Edit2 size={16} />
                            Edit Configuration
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/settlement-banks')}>
                            <ArrowLeft size={16} />
                            Back to List
                        </Button>
                    </ToolbarActions>
                </Toolbar>
            </Container>

            <Container>
                <Card>
                    <CardHeader>
                        <CardHeading>Auto Settlement Information</CardHeading>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Banknote className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Settlement Bank Code</p>
                                    <p className="text-sm text-muted-foreground">{autoSettlement.code}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <WalletIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Wallet</p>
                                    <p className="text-sm text-muted-foreground">{autoSettlement.wallet.name}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Minimum Threshold</p>
                                    <p className="text-sm text-muted-foreground">
                                        {formatKoboToNaira(autoSettlement.minimum_kobo)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Frequency</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {autoSettlement.frequency_label || 'Daily'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Account Name</p>
                                    <p className="text-sm text-muted-foreground">
                                        {autoSettlement.settlement_bank.name}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Account Number</p>
                                    <p className="text-sm text-muted-foreground">
                                        {autoSettlement.settlement_bank.account_no}
                                    </p>
                                </div>
                            </div>
                            
                        </div>
                    </CardContent>
                </Card>
            </Container>

            {/* Edit Configuration Modal */}
            <EditAutoSettlementConfiguration 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onEditAutoSettlement={handleEditSuccess} 
                autosettleMent={autoSettlement} 
            />
        </Fragment>
    );
}