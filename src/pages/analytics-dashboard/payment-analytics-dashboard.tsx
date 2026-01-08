

import { Container } from "@/components/common/container";
import { Toolbar, ToolbarHeading } from "@/layouts/demo1/components/toolbar";
import { useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { PaymentTypeChart } from "./components/payment-type-chart";
import { MetricCard } from "./components/metric-card";
import { AlertTriangle, Banknote, CheckCircle, Clock, Coins, DollarSign, Percent, TrendingUp, Users, Wallet } from "lucide-react";
import { TransactionStatusChart } from "./components/transaction-status-chart";
import { ChannelBreakdown } from "./components/chanel-breakdown";
import { CustomerBehaviorChart } from "./components/customer-bahavior-chart";
import { TopCustomersChart } from "./components/top-customers-chart";
import { TransactionVolumeChart } from "./components/transaction-volume-chart";

export function PaymentAnalyticsDashboard() {
    const [timeRange, setTimeRange] = useState('monthly');
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
                            value={formatNumber(100)}
                            subtitle="Completed payments"
                            icon={Wallet}
                            trend={{ value: 12.4, isPositive: true }}
                            variant="accent"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Average transaction."
                            value={formatCurrency(10000)}
                            subtitle="Per payment"
                            icon={TrendingUp}
                            trend={{ value: 100, isPositive: true }}
                            variant="warning"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Success Rate."
                            value={`87.6%`}
                            subtitle="Transaction completion"
                            icon={CheckCircle}
                            trend={{ value: 20, isPositive: true }}
                            variant="success"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="New Customers."
                            value={formatNumber(1900)}
                            subtitle="This period"
                            icon={Users}
                            variant="accent"
                            trend={{ value: 20, isPositive: true }}
                        ></MetricCard>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 lg:gap-7.5 mt-3">
                    <div className="col-span-1">
                        <MetricCard
                            title="Total Charges."
                            value={formatCurrency(5000)}
                            subtitle="Charged fees"
                            icon={Coins}
                            variant="warning"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Avg Processing Time."
                            value={`1.3s`}
                            subtitle="Transaction completion"
                            icon={Clock}
                            variant="warning"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Refund Rate."
                            value={`1.3%`}
                            subtitle="Of total transactions"
                            icon={AlertTriangle}
                            variant="default"
                        ></MetricCard>
                    </div>
                    <div className="col-span-1">
                        <MetricCard
                            title="Settlement Rate."
                            value={`96.5%`}
                            subtitle="Reconciled payments"
                            icon={Percent}
                            variant="success"
                        ></MetricCard>
                    </div>
                </div>
            </Container>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-3">
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