import { Fragment, useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, CreditCard, Users, BanknoteIcon } from 'lucide-react';
import { useDashboardStatistics } from '@/hooks/use-dashboard';

interface IRevenueStatsItem {
  icon: React.ElementType;
  value: string;
  label: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  color: string;
}

type IRevenueStatsItems = Array<IRevenueStatsItem>;

const PaymentRevenueStats = () => {
  const defaultRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');
    return { start_date: formatDate(start), end_date: formatDate(now) };
  }, []);

  const { data, isLoading } = useDashboardStatistics(defaultRange);

  const formatter = useMemo(() => new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }), []);

  const stats: IRevenueStatsItems = [
    {
      icon: BanknoteIcon,
      value: data ? formatter.format(data.paymentRevenue) : '₦ 0',
      label: 'Payment Revenue',
      color: 'text-primary'
    },
    {
      icon: Wallet,
      value: data ? formatter.format(data.walletBalance) : '₦ 0',
      label: 'Wallet Balance',
      color: 'text-success'
    },
    {
      icon: Users,
      value: data ? data.customers.toString() : '0',
      label: 'Customers',
      color: 'text-info'
    },
    {
      icon: CreditCard,
      value: data ? data.totalTransactions.toString() : '0',
      label: 'Total Transactions',
      color: 'text-warning'
    },
  ];

  const renderStat = (stat: IRevenueStatsItem, index: number) => {
    const Icon = stat.icon;

    return (
      <Card key={index} className="h-full">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-lg bg-${stat.color.replace('text-', '')}/10 flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            {isLoading && <div className="text-xs text-muted-foreground">Loading...</div>}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-semibold text-foreground">
              {stat.value}
            </span>
            <span className="text-sm text-muted-foreground">
              {stat.label}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Fragment>
      {stats.map((stat, index) => renderStat(stat, index))}
    </Fragment>
  );
};

export { PaymentRevenueStats, type IRevenueStatsItem, type IRevenueStatsItems };
