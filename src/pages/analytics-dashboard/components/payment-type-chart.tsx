import { useEffect, useMemo, useState } from 'react';
import { ApexOptions } from 'apexcharts';
import ApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminStatsService } from '@/services/admin-stats.service';
import { notify } from '@/lib/notifications';

const PaymentTypeChart = () => {
  const [chartData, setChartData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  // Prepare data for ApexCharts

  const fetchChartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminStatsService.getPaymentMethodBreakdown();

      const paymentData = response.data;
      const labels = Object.keys(paymentData);
      const series = labels.map((type) => paymentData[type].count);

      setChartData({
        series,
        labels,
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

  const options: ApexOptions = {
    series: chartData?.series ?? [],
    chart: {
      height: 300,
      width: '100%',
      type: 'pie',
      toolbar: {
        show: false,
      },
    },
    labels: chartData?.labels ?? [],
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
        const paymentType = chartData?.labels[seriesIndex];

        const formatter = new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
        });

        const formattedRevenue = formatter.format(revenue);

        return `
          <div class="flex flex-col gap-2 p-3.5">
            <div class="font-medium text-sm text-secondary-foreground">${paymentType}</div>
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
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-destructive">Failed to load chart data</p>
            </div>
          ) : (
            <ApexChart
              id="revenue_chart"
              options={options}
              series={options.series}
              type="pie"
              height="300"
            />
          )}

        </CardContent>
      </Card>
    </>
  );
};

export { PaymentTypeChart };
