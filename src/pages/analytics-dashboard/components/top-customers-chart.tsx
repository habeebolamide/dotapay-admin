import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { topCustomers } from "../data/mockData";
import { TrendingUp } from "lucide-react";


const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);
};

export function TopCustomersChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Top Customers</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {topCustomers.map((customer, index) => (
                        <div
                            key={customer.id}
                            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                        >
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-mono font-bold text-sm">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {customer.transactions.toLocaleString()} transactions
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-mono font-semibold text-primary">
                                    {formatCurrency(customer.value)}
                                </p>
                                <div className="flex items-center justify-end gap-1 text-xs text-success">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>Active</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}