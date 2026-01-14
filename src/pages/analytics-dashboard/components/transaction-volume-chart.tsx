import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "react-apexcharts";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from "react";
import { adminStatsService } from "@/services/admin-stats.service";
import { notify } from "@/lib/notifications";

interface TransactionVolumeData {
    period: string;
    year: number;
    month: number | null;
    day: number | null;
    data: Record<string, number>;
}

export function TransactionVolumeChart() {
    const [timeframe, setTimeframe] = useState("monthly");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [chartData, setChartData] = useState<TransactionVolumeData | null>(null);

    const fetchChartData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminStatsService.getTransactionVolume({
                period: timeframe
            });
            setChartData(response.data);
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
    }, [timeframe]);

    const categories = chartData ? Object.keys(chartData) : [];
    const transactions = chartData ? Object.values(chartData) : [];

    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: {
                show: false,
            }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#FFFFFF',
                    fontSize: '12px'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            title: {
                text: 'Transaction Count',
            },
        },
        fill: {
            opacity: 1,
        },
        colors: ['#00E396'],
        tooltip: {
            y: {
                formatter: (val) => `${val} transactions`
            }
        }
    };

    const series = [
        {
            name: 'Transactions',
            data: transactions,
        },
    ];

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="flex w-full items-center justify-between">
                    <CardTitle>Transaction Volume</CardTitle>
                    <div className="flex items-center gap-2">
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={'hourly'}>
                                    Hourly
                                </SelectItem>
                                <SelectItem value={'daily'}>
                                    Daily
                                </SelectItem>
                                <SelectItem value={'weekly'}>
                                    Weekly
                                </SelectItem>
                                <SelectItem value={'monthly'}>
                                    Monthly
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex flex-col justify-end items-stretch grow px-3 py-1">
                {loading ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <p className="text-muted-foreground">Loading chart data...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-[400px]">
                        <p className="text-destructive">Failed to load chart data</p>
                    </div>
                ) : (
                    <Chart options={chartOptions} series={series} type="bar" height={400} />
                )}
            </CardContent>
        </Card>
    );
}