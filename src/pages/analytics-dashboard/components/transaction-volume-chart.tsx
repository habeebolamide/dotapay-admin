import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Chart from "react-apexcharts";
import { transactionVolumeData } from "../data/mockData";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from "react";

export function TransactionVolumeChart() {

    const dates = transactionVolumeData.map((data) => data.date);
    const transactions = transactionVolumeData.map((data) => data.transactions);
    const [timeframe, setTimeframe] = useState("monthly");

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
                // endingShape: 'rounded',
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: dates,
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
                text: 'Customer Count',
            },
        },
        fill: {
            opacity: 1,
        },
        colors: ['#00E396', '#0090FF'], // Different colors for new and returning customers
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
                        <Select value={timeframe} onValueChange={setTimeframe} >
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Monthly" />
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
                <Chart options={chartOptions} series={series} type="bar" height={400} />
            </CardContent>
        </Card>
    );
}