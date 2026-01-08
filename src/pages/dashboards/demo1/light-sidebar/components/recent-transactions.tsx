import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Transaction {
  reference: string;
  customer: string;
  amount: number;
  status: 'APPROVED' | 'PENDING' | 'FAILED';
  channel: string;
  date: string;
}

const RecentTransactions = () => {
  // Dummy data - will be replaced with actual API data
  const transactions: Transaction[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'FAILED':
        return 'destructive';
      case 'PENDING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Transaction</CardTitle>
          <Button variant="link" asChild>
            <Link to="/transactions">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-muted-foreground mb-2">No matching records found</div>
            <p className="text-sm text-muted-foreground">
              Transactions will appear here when customers make payments
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    REFERENCE
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    CUSTOMER
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    AMOUNT
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    STATUS
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    CHANNEL
                  </th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">
                    DATE PAID
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-2">
                      <span className="font-mono text-sm">{transaction.reference}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm">{transaction.customer}</span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="font-medium text-sm">
                        {formatAmount(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        size="sm"
                        variant={getStatusColor(transaction.status) as any}
                      >
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge size="sm" variant="outline">
                        {transaction.channel}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-muted-foreground">
                        {transaction.date}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export { RecentTransactions };
