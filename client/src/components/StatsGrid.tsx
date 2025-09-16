import { useQuery } from "@tanstack/react-query";
import type { DashboardStats } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Thermometer, QrCode, CheckCircle } from "lucide-react";

export default function StatsGrid() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-20"></div>
                    <div className="h-8 bg-muted rounded w-12"></div>
                  </div>
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                </div>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="h-4 bg-muted rounded w-12"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Batches",
      value: stats?.activeBatches || 0,
      icon: Package,
      color: "primary",
      change: "+12%",
      changeLabel: "vs last month",
    },
    {
      title: "Connected Sensors",
      value: stats?.connectedSensors || 0,
      icon: Thermometer,
      color: "secondary",
      change: "98.5%",
      changeLabel: "uptime",
    },
    {
      title: "QR Scans Today",
      value: stats?.qrScansToday || 0,
      icon: QrCode,
      color: "accent",
      change: "+8.3%",
      changeLabel: "vs yesterday",
    },
    {
      title: "Quality Score",
      value: `${stats?.qualityScore?.toFixed(1) || 0}%`,
      icon: CheckCircle,
      color: "green",
      change: "+2.1%",
      changeLabel: "vs last week",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stat.color === "primary" ? "bg-primary/10" :
                stat.color === "secondary" ? "bg-secondary/10" :
                stat.color === "accent" ? "bg-accent/10" :
                "bg-green-100"
              }`}>
                <stat.icon className={`${
                  stat.color === "primary" ? "text-primary" :
                  stat.color === "secondary" ? "text-secondary" :
                  stat.color === "accent" ? "text-accent" :
                  "text-green-600"
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              <span className="text-sm text-muted-foreground ml-2">{stat.changeLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
