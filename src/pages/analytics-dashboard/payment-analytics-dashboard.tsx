

import { Container } from "@/components/common/container";
import { Toolbar, ToolbarActions, ToolbarHeading } from "@/layouts/demo1/components/toolbar";
import { useEffect, useMemo, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { PaymentTypeChart } from "./components/payment-type-chart";
import { MetricCard } from "./components/metric-card";
import { AlertTriangle, Banknote, BanknoteIcon, CalendarDays, CheckCircle, Clock, Coins, DollarSign, Percent, TrendingUp, Users, Wallet } from "lucide-react";
import { TransactionStatusChart } from "./components/transaction-status-chart";
import { ChannelBreakdown } from "./components/chanel-breakdown";
import { CustomerBehaviorChart } from "./components/customer-bahavior-chart";
import { TopCustomersChart } from "./components/top-customers-chart";
import { TransactionVolumeChart } from "./components/transaction-volume-chart";
import { adminStatsService } from "@/services/admin-stats.service";
import { notify } from "@/lib/notifications";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { addDays, format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";


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

    const [isOpen, setIsOpen] = useState(false);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(2025, 0, 20),
        to: addDays(new Date(2025, 0, 20), 20),
    });
    const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(
        date,
    );

    const handleDateRangeApply = () => {
        setDate(tempDateRange); // Save the temporary date range to the main state
        setIsOpen(false); // Close the popover
    };

    const handleDateRangeReset = () => {
        setTempDateRange(undefined); // Reset the temporary date range
    };

    const defaultStartDate = new Date();

    useEffect(() => {
        fetchAnalytics();
    }, [date]);

    const fetchAnalytics = async () => {
        setLoading(true);
        setError(null);
        try {
            const startDate = date?.from ? format(date.from, 'yyyy-MM-dd') : undefined;
            const endDate = date?.to ? format(date.to, 'yyyy-MM-dd') : undefined;

            const params = {
                start_date: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
                end_date: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
            };

            const response = await adminStatsService.getAnalyticsStats(params);
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
                    <ToolbarActions>
                        <Popover open={isOpen} onOpenChange={setIsOpen}>
                            <PopoverTrigger asChild>
                                <Button id="date" variant="outline">
                                    <CalendarDays size={16} className="me-0.5" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, 'LLL dd, y')} -{' '}
                                                {format(date.to, 'LLL dd, y')}
                                            </>
                                        ) : (
                                            format(date.from, 'LLL dd, y')
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={tempDateRange?.from || defaultStartDate}
                                    selected={tempDateRange}
                                    onSelect={setTempDateRange}
                                    numberOfMonths={2}
                                />
                                <div className="flex items-center justify-end gap-1.5 border-t border-border p-3">
                                    <Button variant="outline" onClick={handleDateRangeReset}>
                                        Reset
                                    </Button>
                                    <Button onClick={handleDateRangeApply}>Apply</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </ToolbarActions>
                </Toolbar>
            </Container>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 lg:gap-7.5">
                    <div className="col-span-1">
                        <MetricCard
                            title="Total Amount Processed."
                            value={formatCurrency(analytics?.total_amount_processed / 100 || 0)}
                            subtitle="Completed payments"
                            icon={BanknoteIcon}
                            // trend={{ value: 12.4, isPositive: true }}
                            variant="warning"
                        ></MetricCard>
                    </div>
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
                            value={formatCurrency(analytics?.average_transaction_value / 100 || 0)}
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
                            value={formatCurrency(analytics?.total_charges / 100 || 0)}
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
                            variant="accent"
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
                    <div className="col-span-1">
                        <MetricCard
                            title="Refund Rate."
                            value={`${analytics?.refund_rate || 0}%`}
                            subtitle="Of total transactions"
                            icon={AlertTriangle}
                            variant="accent"
                        ></MetricCard>
                    </div>
                </div>
            </Container>

            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
                    <CustomerBehaviorChart />
                    <TopCustomersChart />
                </div>
            </Container>
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
                    <TransactionStatusChart />
                    <PaymentTypeChart />
                    {/* <ChannelBreakdown /> */}
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