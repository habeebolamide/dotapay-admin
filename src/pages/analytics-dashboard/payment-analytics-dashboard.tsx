

import { Container } from "@/components/common/container";
import { Toolbar, ToolbarHeading } from "@/layouts/demo1/components/toolbar";
import { useEffect, useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { PaymentTypeChart } from "./components/payment-type-chart";
import { MetricCard } from "./components/metric-card";
import { AlertTriangle, Banknote, CheckCircle, Clock, Coins, DollarSign, Percent, TrendingUp, Users, Wallet } from "lucide-react";
import { TransactionStatusChart } from "./components/transaction-status-chart";
import { ChannelBreakdown } from "./components/chanel-breakdown";
import { CustomerBehaviorChart } from "./components/customer-bahavior-chart";
import { TopCustomersChart } from "./components/top-customers-chart";
import { TransactionVolumeChart } from "./components/transaction-volume-chart";
import { adminStatsService } from "@/services/admin-stats.service";
import { notify } from "@/lib/notifications";

export function PaymentAnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState('monthly');

    const [analytics, setAnalytics] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(value);
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminStatsService.getAnalyticsStats();
            setAnalytics(response);
        } catch (err) {
            setError(err as Error);
            notify.error('Failed to analytics data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <Container>
                <Toolbar>
                    <ToolbarHeading
                        title="Payment Analytics"
                        description="Comprehensive insights of payment operations"
                    />
                </Toolbar>
            </Container>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-7.5">
                    <div className="col-span-1">
                        <MetricCard
                            title="Total Transactions."
                            value={formatNumber(analytics?.total_transactions || 0)}
                            subtitle="Completed payments"
                            icon={Wallet}
                            // trend={{ value: 12.4, isPositive: true }}
                            variant="accent"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Average transaction."
                            value={formatCurrency(analytics?.average_transaction_value || 0)}
                            subtitle="Per payment"
                            icon={TrendingUp}
                            // trend={{ value: 100, isPositive: true }}
                            variant="warning"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Success Rate."
                            value={`${analytics?.success_rate || 0}%`}
                            subtitle="Transaction completion"
                            icon={CheckCircle}
                            // trend={{ value: 20, isPositive: true }}
                            variant="success"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="New Customers."
                            value={formatNumber(analytics?.new_customers || 0)}
                            subtitle="This period"
                            icon={Users}
                            variant="accent"
                        // trend={{ value: 20, isPositive: true }}
                        ></MetricCard>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-7.5 mt-3">
                    <div className="col-span-1">
                        <MetricCard
                            title="Total Charges."
                            value={formatCurrency(analytics?.total_charges || 0)}
                            subtitle="Charged fees"
                            icon={Coins}
                            variant="warning"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Avg Processing Time."
                            value={`${analytics?.average_processing_time}s`}
                            subtitle="Transaction completion"
                            icon={Clock}
                            variant="warning"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Refund Rate."
                            value={`${analytics?.refund_rate || 0}%`}
                            subtitle="Of total transactions"
                            icon={AlertTriangle}
                            variant="default"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Settlement Rate."
                            value={`${analytics?.settlement_total_count > 0
                                ? ((analytics?.settlement_success_count / analytics?.settlement_total_count) * 100).toFixed(1)
                                : 0}%`}
                            subtitle="Reconciled payments"
                            icon={Percent}
                            variant="success"
                        ></MetricCard>
                    </div>
                </div>
            </Container>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">
                    <TransactionStatusChart />
                    <PaymentTypeChart />
                    <ChannelBreakdown />
                </div>
            </Container>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
                    <CustomerBehaviorChart />
                    <TopCustomersChart />
                </div>
            </Container>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-3">
                    <TransactionVolumeChart />
                </div>
            </Container>

        </Fragment>
    )
}