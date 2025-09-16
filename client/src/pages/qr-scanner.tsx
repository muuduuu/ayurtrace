import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import type { TraceabilityData } from "@shared/schema";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, QrCode, Search } from "lucide-react";

export default function QRScanner() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [qrCode, setQrCode] = useState("");
  const [searchQrCode, setSearchQrCode] = useState("");

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

  const { data: traceabilityData, isLoading: isTracing, error } = useQuery<TraceabilityData>({
    queryKey: ["/api/qr-provenance", searchQrCode],
    enabled: !!searchQrCode,
    retry: false,
  });

  const handleQrCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrCode.trim()) {
      setSearchQrCode(qrCode.trim());
    }
  };

  const handleScanQr = () => {
    // In a real implementation, this would use the device camera
    toast({
      title: "Camera Scanner",
      description: "Camera QR scanning would be implemented with react-qr-scanner library",
    });
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <header className="bg-card border-b border-border px-6 py-4">
            <h1 className="text-2xl font-bold text-foreground">QR Scanner</h1>
            <p className="text-muted-foreground">Scan or search QR codes for complete traceability</p>
          </header>
          
          <div className="p-6 space-y-6">
            {/* Scanner Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Camera Scanner
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-black rounded-lg aspect-square max-w-sm mx-auto relative">
                      <div className="absolute inset-4 border-2 border-primary rounded-lg"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                        <Camera className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Point camera at QR code</p>
                      </div>
                      <div className="absolute top-8 left-8 right-8 h-0.5 bg-primary animate-pulse"></div>
                    </div>
                    <Button 
                      onClick={handleScanQr} 
                      className="w-full bg-primary text-primary-foreground"
                      data-testid="button-start-scan"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera Scanner
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="w-5 h-5 mr-2" />
                    Manual Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleQrCodeSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Enter QR Code</label>
                      <Input
                        value={qrCode}
                        onChange={(e) => setQrCode(e.target.value)}
                        placeholder="e.g., AYU-12345678"
                        className="w-full"
                        data-testid="input-qr-code"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-secondary text-secondary-foreground"
                      disabled={!qrCode.trim() || isTracing}
                      data-testid="button-search-qr"
                    >
                      {isTracing ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      Search Traceability
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Traceability Results */}
            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="text-center text-destructive">
                    <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">QR Code Not Found</p>
                    <p className="text-sm mt-2">
                      {isUnauthorizedError(error as Error) 
                        ? "Authentication required" 
                        : "The QR code you entered does not exist in our system."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {traceabilityData && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="w-5 h-5 mr-2" />
                    Traceability Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Batch Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Batch Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Batch Number:</span>
                          <p className="font-mono">{traceabilityData.batch.batchNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Product:</span>
                          <p>{traceabilityData.product.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Status:</span>
                          <p className="capitalize">{traceabilityData.batch.status}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Quality Score:</span>
                          <p>{traceabilityData.batch.qualityScore}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Farm Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Farm Origin</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-muted-foreground">Farm Name:</span>
                          <p>{traceabilityData.farm.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-muted-foreground">Location:</span>
                          <p>{traceabilityData.farm.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Processing Events */}
                    {traceabilityData.processingEvents.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Processing History</h3>
                        <div className="space-y-2">
                          {traceabilityData.processingEvents.map((event, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div>
                                <p className="font-medium capitalize">{event.processType.replace('_', ' ')}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(event.processDate!).toLocaleDateString()}
                                </p>
                              </div>
                              {event.qualityScore && (
                                <div className="text-right">
                                  <p className="text-sm font-medium">{event.qualityScore}%</p>
                                  <p className="text-xs text-muted-foreground">Quality</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
