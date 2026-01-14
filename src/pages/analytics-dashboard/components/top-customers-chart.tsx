import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { adminStatsService } from "@/services/admin-stats.service";
import { useEffect, useState } from "react";
import { notify } from "@/lib/notifications";


const formatCurrency = (value: number) => {



    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
};




export function TopCustomersChart() {

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);

    const fetchTopCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await adminStatsService.getTopCustomers();
            console.log(response,"Top Customer");
            
            setTopCustomers(response);
        } catch (err) {
            console.warn(err, "Error");
            setError(err as Error);
            notify.error('Failed to fetch chart data');
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        fetchTopCustomers()
    },[])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topCustomers?.map((customer, index) => (
                        <div
                            key={customer.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-mono font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{customer.business_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {customer.total_transactions.toLocaleString()} transactions
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-semibold text-primary">
                                    {formatCurrency(customer.total_amount / 100)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}