import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, QrCode, Thermometer, CheckCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "batch_created",
    title: "New batch created",
    description: "Turmeric Batch #TUR-2024-003 added by Farmer Raj Kumar",
    time: "2 minutes ago",
    icon: Plus,
    color: "primary",
  },
  {
    id: 2,
    type: "qr_scanned",
    title: "QR Code scanned",
    description: "Consumer traced Ashwagandha Batch #ASH-2024-001",
    time: "15 minutes ago",
    icon: QrCode,
    color: "secondary",
  },
  {
    id: 3,
    type: "temperature_alert",
    title: "Temperature alert resolved",
    description: "Storage facility A-12 back to optimal range",
    time: "1 hour ago",
    icon: Thermometer,
    color: "accent",
  },
  {
    id: 4,
    type: "processing_completed",
    title: "Processing completed",
    description: "Neem leaves batch processed and ready for packaging",
    time: "3 hours ago",
    icon: CheckCircle,
    color: "green",
  },
];

export default function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start space-x-3 pb-4 border-b border-border last:border-b-0"
              data-testid={`activity-${activity.type}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                activity.color === "primary" ? "bg-primary/10" :
                activity.color === "secondary" ? "bg-secondary/10" :
                activity.color === "accent" ? "bg-accent/10" :
                "bg-green-100"
              }`}>
                <activity.icon className={`text-xs ${
                  activity.color === "primary" ? "text-primary" :
                  activity.color === "secondary" ? "text-secondary" :
                  activity.color === "accent" ? "text-accent" :
                  "text-green-600"
                }`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>

        <Button 
          variant="ghost" 
          className="w-full mt-4 text-sm text-primary hover:text-primary/80 font-medium"
          data-testid="button-view-all-activities"
        >
          View all activities
        </Button>
      </CardContent>
    </Card>
  );
}
