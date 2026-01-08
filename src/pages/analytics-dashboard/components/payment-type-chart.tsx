import { useMemo, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import ApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PaymentTypeChart = () => {
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());

  const paymentTypes: string[] = ['Card', 'Transfer', 'USSD', 'Wallet'];

  const chartData = useMemo(() => {
    return [500000, 200000, 150000, 100000];
  }, []);

  const options: ApexOptions = {
    series: chartData ?? [],
    chart: {
      height: 300,
      width: '100%',
      type: 'pie',
      toolbar: {
        show: false,
      },
    },
    labels: paymentTypes,
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false,
      itemMargin: {
        horizontal: 10,
      },
      labels: {
        colors: 'var(--color-secondary-foreground)',
      },
    },
    tooltip: {
      enabled: true,
      custom({ series, seriesIndex }) {
        const revenue = series[seriesIndex];
        const paymentType = paymentTypes[seriesIndex];

        const formatter = new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
        });

        const formattedRevenue = formatter.format(revenue);

        return `
          <div class="flex flex-col gap-2 p-3.5">
            <div class="font-medium text-sm text-secondary-foreground">${paymentType} Revenue (${year})</div>
            <div class="font-semibold text-base text-mono">${formattedRevenue}</div>
          </div>
        `;
      },
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <>
      <style>{`
        .apexcharts-legend {
          display: flex !important;
          flex-direction: row !important;
          justify-content: center !important;
          align-items: center !important;
        }
      `}</style>

      <Card className="h-full">
        <CardHeader>
          <div className="flex w-full items-center justify-between">
            <CardTitle>Payment Method</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-end items-stretch grow px-3 py-1">
          <ApexChart
            id="revenue_chart"
            options={options}
            series={options.series}
            type="pie"
            height="300"
          />
        </CardContent>
      </Card>
    </>
  );
};

export { PaymentTypeChart };
