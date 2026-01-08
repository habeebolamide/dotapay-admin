import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: "default" | "success" | "warning" | "accent" | 'transparent';
    className?: string;
}

const variantStyles = {
    default: "border-border/50",
    success: "border-success/30",
    warning: "border-warning/30",
    accent: "border-accent/30",
};

const iconVariantStyles = {
    default: "bg-primary text-foreground",
    success: "bg-success/20 text-success",
    warning: "bg-[#153144] text-[#19a1e5]",
    accent: "bg-accent/60",
    transparent: "bg-transparent text-muted-foreground",
};

export function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    variant = "default",
}: MetricCardProps) {


    return (
        <Card className="h-full">
            <CardContent className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="metric-label">{title}</p>
                        <p className="metric-value text-3xl">{value}</p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground">{subtitle}</p>
                        )}
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${ variant ? iconVariantStyles[variant] : 'bg-transparent'} flex items-center justify-center`}
                    >
                        <Icon className={`h-5 w-5`} />
                    </div>
                </div>
                {trend != null && (
                    <div className="mt-2 flex items-center gap-1">
                        <span
                            className={cn(
                                "text-sm font-medium",
                                trend.isPositive ? "text-success" : "text-destructive"
                            )}
                        >
                            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs last period</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
