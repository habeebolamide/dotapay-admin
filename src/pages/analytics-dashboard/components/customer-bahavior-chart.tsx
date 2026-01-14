import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { notify } from "@/lib/notifications";
import { adminStatsService } from "@/services/admin-stats.service";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

export function CustomerBehaviorChart() {

    const [chartData, setChartData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);


    // Prepare data for ApexCharts

    const fetchChartData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminStatsService.WeeklyCustomerActivities();

            const newCustomersData = response.data.new_customers;
            const returningCustomersData = response.data.returning_customers;

            const newCustomers = Object.values(newCustomersData);
            const returningCustomers = Object.values(returningCustomersData);
            const daysOfWeek = Object.keys(newCustomersData);

            setChartData({
                newCustomers,
                returningCustomers,
                daysOfWeek,
            });

            // console.log(response, "Data");


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
            categories: chartData?.daysOfWeek || [],
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
           data: chartData?.newCustomers || [],
        },
        {
            name: 'Returning Customers',
            data: chartData?.returningCustomers || [],
        },
    ];

    return (
        <Card>
            <CardHeader>
                Weekly Customer Activity
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p>Error loading data</p>
                ) : (
                    <Chart options={chartOptions} series={series} type="bar" height={400} />
                )}
            </CardContent>
        </Card>
    );
}
