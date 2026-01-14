import Chart from "react-apexcharts";
import { CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminStatsService } from "@/services/admin-stats.service";
import { useEffect, useState } from "react";
import { notify } from "@/lib/notifications";


const COLORS = [
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#6366f1",
];

const ICONS = [CheckCircle2, XCircle, Clock, RotateCcw];

export function TransactionStatusChart() {
    const [chartData, setChartData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);


    // Prepare data for ApexCharts

    const fetchChartData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminStatsService.getTransactionStatuses();

            const transactionData = response.data;
            const labels = Object.keys(transactionData);
            const series = labels.map((status) => transactionData[status].percentage);

            setChartData({
                series,
                labels,
                successRate: transactionData.Successful.percentage,
                counts: transactionData,
            });

        } catch (err) {
            console.warn(err, "Error");
            setError(err as Error);
            notify.error('Failed to fetch chart data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, []);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: "donut",
            sparkline: { enabled: true }, // Removes extra padding
        },
        colors: COLORS,
        stroke: { show: false },
        labels: chartData?.labels,
        plotOptions: {
            pie: {
                donut: {
                    size: "75%",
                },
            },
        },
        tooltip: {
            enabled: true,
            y: {
                formatter: (val, { seriesIndex }) => {
                    const status = chartData?.labels[seriesIndex];
                    const count = chartData?.counts[status]?.count || 0;
                    return `${val}% (${count.toLocaleString()} txns)`;
                },
            },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        states: {
            hover: {
                filter: {
                    type: 'darken',
                    value: 0.9,
                } as any
            },
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction Status</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <p className="text-destructive">Failed to load chart data</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8">

                        <div className="flex w-full justify-center lg:justify-start">
                            <div className="relative w-[180px] h-[180px]">
                                <Chart
                                    options={chartOptions}
                                    series={chartData?.series}
                                    type="donut"
                                    width="100%"
                                    height="100%"
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-mono font-bold text-green-500">
                                        {chartData?.successRate}%
                                    </span>
                                    <span className="text-xs text-muted-foreground">Success</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            {chartData?.labels?.map((status: any, index: number) => {
                                const Icon = ICONS[index];
                                const count = chartData?.counts[status]?.count;
                                const percentage = chartData?.counts[status]?.percentage;

                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="p-1.5 rounded-lg"
                                                style={{ backgroundColor: `${COLORS[index]}20` }}
                                            >
                                                <Icon className="w-4 h-4" style={{ color: COLORS[index] }} />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium">{status}</span>
                                                <p className="text-xs text-muted-foreground">
                                                    {count.toLocaleString()} txns
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm font-mono font-medium">{percentage}%</span>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                )}

            </CardContent>
        </Card>
    );
}