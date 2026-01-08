import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Smartphone, Code } from "lucide-react";
import { channelData } from "../data/mockData";

const ICONS = {
    Web: Globe,
    Mobile: Smartphone,
    API: Code,
};

export function ChannelBreakdown() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Channel Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-5">
                    {channelData.map((channel) => {
                        const Icon = ICONS[channel.channel as keyof typeof ICONS];
                        return (
                            <div key={channel.channel} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/20">
                                            <Icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{channel.channel}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {channel.transactions.toLocaleString()} transactions
                                            </p>
                                        </div>
                                    </div>
                                    <span className="font-mono font-semibold">{channel.percentage}%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${channel.percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
