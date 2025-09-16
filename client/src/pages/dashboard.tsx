import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import StatsGrid from "@/components/StatsGrid";
import SensorChart from "@/components/SensorChart";
import ActivityFeed from "@/components/ActivityFeed";
import BatchTable from "@/components/BatchTable";
import QRTools from "@/components/QRTools";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Ayurvedic Traceability</h1>
          <button className="p-2 rounded-md hover:bg-muted">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">{(user as User)?.firstName?.[0] || "U"}</span>
            </div>
          </button>
        </div>
      )}

      <div className="flex h-screen lg:h-auto">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Desktop Header */}
          {!isMobile && (
            <header className="bg-card border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground">Monitor your Ayurvedic product traceability in real-time</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button className="bg-primary text-primary-foreground hover:opacity-90" data-testid="button-new-batch">
                    <Plus className="w-4 h-4 mr-2" />
                    New Batch
                  </Button>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{(user as User)?.firstName?.[0] || "U"}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {(user as User)?.firstName && (user as User)?.lastName 
                        ? `${(user as User).firstName} ${(user as User).lastName}` 
                        : (user as User)?.email || "User"}
                    </span>
                  </div>
                </div>
              </div>
            </header>
          )}

          {/* Dashboard Content */}
          <div className="p-6 space-y-6">
            <StatsGrid />

            {/* Real-time Sensor Data & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SensorChart />
              <ActivityFeed />
            </div>

            {/* Batch Management & QR Scanner */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BatchTable />
              </div>
              <QRTools />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
