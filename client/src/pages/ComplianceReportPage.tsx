import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/Sidebar";
import StatsGrid from "@/components/StatsGrid";
import { useIsMobile } from "@/hooks/use-mobile";
import { fetchComplianceReport } from "@/lib/complianceApi"; // Make sure this API function is correctly defined

export default function ComplianceReportPage() {
  const { toast } = useToast();
  const [complianceData, setComplianceData] = useState<any>(null);
  const isMobile = useIsMobile();
  
  // Updated useQuery call
  const { data, isLoading, error } = useQuery({
    queryKey: ["complianceReport"], // Correct query key
    queryFn: fetchComplianceReport, // The API function
  });

  useEffect(() => {
    if (data) {
      setComplianceData(data);
    }
    if (error) {
      toast({
        title: "Error fetching data",
        description: "There was an issue fetching the compliance report data.",
        variant: "destructive",
      });
    }
  }, [data, error, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Compliance Report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <div className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Compliance Report</h1>
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
                  <h1 className="text-2xl font-bold text-foreground">Compliance Report</h1>
                  <p className="text-muted-foreground">Monitor compliance for Ayurvedic product traceability in real-time</p>
                </div>
              </div>
            </header>
          )}

          {/* Compliance Report Content */}
          <div className="p-6 space-y-6">
            <StatsGrid />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Display the compliance report data */}
              <Card>
                <CardContent>
                  <h2 className="text-xl font-bold text-foreground">Compliance Overview</h2>
                  <p className="mt-4 text-muted-foreground">Here’s a summary of your Ayurvedic product traceability compliance:</p>
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-4" />
                      <p className="text-sm">{complianceData?.complianceStatus || "No compliance status available"}</p>
                    </div>
                    <div className="flex items-center">
                      <FileText className="w-6 h-6 text-accent mr-4" />
                      <p className="text-sm">{complianceData?.reportDetails || "No additional details available"}</p>
                    </div>
                  </div>
                  <Button className="mt-6 bg-primary text-primary-foreground">Download Report</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
