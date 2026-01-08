import Chart from "react-apexcharts";
import { CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";
import { transactionStatusData } from "../data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


const COLORS = [
    "#22c55e", // Success (Tailwind Green-500)
    "#ef4444", // Destructive (Tailwind Red-500)
    "#f59e0b", // Warning (Tailwind Amber-500)
    "#6366f1", // Accent (Tailwind Indigo-500)
];

const ICONS = [CheckCircle2, XCircle, Clock, RotateCcw];

export function TransactionStatusChart() {
    const successRate = transactionStatusData[0].value;

    // Prepare data for ApexCharts
    const series = transactionStatusData.map((item) => item.value);
    const labels = transactionStatusData.map((item) => item.name);

    const chartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: "donut",
            sparkline: { enabled: true }, // Removes extra padding
        },
        colors: COLORS,
        stroke: { show: false },
        labels: labels,
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
                    const count = transactionStatusData[seriesIndex].count;
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
                <div className="flex items-center gap-8">
                    <div className="relative w-[180px] h-[180px]">
                        <Chart
                            options={chartOptions}
                            series={series}
                            type="donut"
                            width="100%"
                            height="100%"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-2xl font-mono font-bold text-green-500">
                                {successRate}%
                            </span>
                            <span className="text-xs text-muted-foreground">Success</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        {transactionStatusData.map((item, index) => {
                            const Icon = ICONS[index];
                            return (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="p-1.5 rounded-lg"
                                            style={{ backgroundColor: `${COLORS[index]}20` }}
                                        >
                                            <Icon className="w-4 h-4" style={{ color: COLORS[index] }} />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium">{item.name}</span>
                                            <p className="text-xs text-muted-foreground">
                                                {item.count.toLocaleString()} txns
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono font-medium">{item.value}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}