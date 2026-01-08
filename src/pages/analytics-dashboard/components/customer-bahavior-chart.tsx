import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { customerBehaviorData } from "../data/mockData";
import Chart from "react-apexcharts";

export function CustomerBehaviorChart() {

    const dates = customerBehaviorData.map((data) => data.date);
    const newCustomers = customerBehaviorData.map((data) => data.newCustomers);
    const returningCustomers = customerBehaviorData.map((data) => data.returningCustomers);

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
            name: 'New Customers',
            data: newCustomers,
        },
        {
            name: 'Returning Customers',
            data: returningCustomers,
        },
    ];

    return (
        <Card>
            <CardHeader>
                Customer Activity
            </CardHeader>
            <CardContent>
                <Chart options={chartOptions} series={series} type="bar" height={400} />
            </CardContent>
        </Card>
    );
}
