import { useMemo, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import ApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRevenueChart } from '@/hooks/use-dashboard';

const PaymentRevenueChart = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');

  const thisYear = new Date().getFullYear().toString();
  const [year, setYear] = useState<string>(thisYear);
  const { data: chartResponse, isLoading } = useRevenueChart({ year });

  const chartData = chartResponse;

  const periodOptions: Array<{ value: 'daily' | 'weekly' | 'monthly' | 'yearly'; label: string }> = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];



  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return [current - 1, current, current + 1].map((y) => y.toString());
  }, []);

  // const options: ApexOptions = {
  //   series: [
  //     {
  //       name: 'Revenue',
  //       data: chartData ?? [],
  //     },
  //   ],
  //   chart: {
  //     height: 350,
  //     type: 'area',
  //     toolbar: {
  //       show: false,
  //     }
  //   },
  //   dataLabels: {
  //     enabled: false,
  //   },
  //   legend: {
  //     show: false,
  //   },
  //   stroke: {
  //     curve: 'smooth',
  //     show: true,
  //     width: 3,
  //     colors: ['var(--color-primary)'],
  //   },
  //   xaxis: {
  //     categories: categories,
  //     axisBorder: {
  //       show: false,
  //     },
  //     axisTicks: {
  //       show: false,
  //     },
  //     labels: {
  //       style: {
  //         colors: 'var(--color-secondary-foreground)',
  //         fontSize: '12px',
  //       },
  //     },
  //     crosshairs: {
  //       position: 'front',
  //       stroke: {
  //         color: 'var(--color-primary)',
  //         width: 1,
  //         dashArray: 3,
  //       },
  //     },
  //     tooltip: {
  //       enabled: false,
  //     },
  //   },
  //   yaxis: {
  //     min: 0,
  //     tickAmount: 5,
  //     axisTicks: {
  //       show: false,
  //     },
  //     labels: {
  //       style: {
  //         colors: 'var(--color-secondary-foreground)',
  //         fontSize: '12px',
  //       },
  //       formatter: (defaultValue) => {
  //         return `₦${defaultValue.toLocaleString()}`;
  //       },
  //     },
  //   },
  //   tooltip: {
  //     enabled: true,
  //     custom({ series, seriesIndex, dataPointIndex }) {
  //       const number = parseInt(series[seriesIndex][dataPointIndex]);
  //       const monthName = categories[dataPointIndex];

  //       const formatter = new Intl.NumberFormat('en-NG', {
  //         style: 'currency',
  //         currency: 'NGN',
  //       });

  //       const formattedNumber = formatter.format(number);

  //       return `
  //         <div class="flex flex-col gap-2 p-3.5">
  //           <div class="font-medium text-sm text-secondary-foreground">${monthName}, ${year} Revenue</div>
  //           <div class="flex items-center gap-1.5">
  //             <div class="font-semibold text-base text-mono">${formattedNumber}</div>
  //           </div>
  //         </div>
  //         `;
  //     },
  //   },
  //   markers: {
  //     size: 0,
  //     colors: 'var(--color-white)',
  //     strokeColors: 'var(--color-primary)',
  //     strokeWidth: 4,
  //     strokeOpacity: 1,
  //     strokeDashArray: 0,
  //     fillOpacity: 1,
  //     discrete: [],
  //     shape: 'circle',
  //     offsetX: 0,
  //     offsetY: 0,
  //     hover: {
  //       size: 8,
  //       sizeOffset: 0,
  //     },
  //   },
  //   fill: {
  //     gradient: {
  //       opacityFrom: 0.25,
  //       opacityTo: 0,
  //     },
  //   },
  //   grid: {
  //     borderColor: 'var(--color-border)',
  //     strokeDashArray: 5,
  //     yaxis: {
  //       lines: {
  //         show: true,
  //       },
  //     },
  //     xaxis: {
  //       lines: {
  //         show: false,
  //       },
  //     },
  //   },
  // };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="w-full flex items-center justify-between">
          <CardTitle>Revenue Chart</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(value) => setPeriod(value as typeof period)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-end items-stretch grow px-3 py-1">
        {/* <ApexChart
          id="revenue_chart"
          options={options}
          series={options.series}
          type="area"
          height="350"
        /> */}
        {isLoading && (
          <p className="text-xs text-muted-foreground mt-2">Loading chart...</p>
        )}
      </CardContent>
    </Card>
  );
};

export { PaymentRevenueChart };
