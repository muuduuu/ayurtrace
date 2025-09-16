import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const recentScans = [
  { qrCode: "TUR-2024-003", status: "verified" },
  { qrCode: "ASH-2024-001", status: "verified" },
  { qrCode: "NEE-2024-007", status: "warning" },
];

export default function QRTools() {
  const { toast } = useToast();

  const handleScanQr = () => {
    toast({
      title: "QR Scanner",
      description: "Camera QR scanning functionality would be implemented here",
    });
  };

  const handleGenerateQr = () => {
    toast({
      title: "QR Generator",
      description: "QR code generation functionality would be implemented here",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={handleScanQr}
            className="w-full bg-primary text-primary-foreground hover:opacity-90"
            data-testid="button-scan-qr"
          >
            <Camera className="w-4 h-4 mr-2" />
            Scan QR Code
          </Button>
          
          <Button 
            onClick={handleGenerateQr}
            className="w-full bg-secondary text-secondary-foreground hover:opacity-90"
            data-testid="button-generate-qr"
          >
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR Code
          </Button>

          {/* Recent QR Scans */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Recent Scans</h3>
            <div className="space-y-3">
              {recentScans.map((scan, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between text-sm"
                  data-testid={`recent-scan-${scan.qrCode}`}
                >
                  <span className="text-muted-foreground font-mono">{scan.qrCode}</span>
                  <span className={
                    scan.status === "verified" ? "text-green-600" : "text-yellow-600"
                  }>
                    {scan.status === "verified" ? "✓ Verified" : "⚠ Warning"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile QR Preview */}
          <div className="pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Mobile Preview</h3>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="w-20 h-20 bg-foreground mx-auto mb-2 rounded">
                <div className="w-full h-full bg-white m-1 rounded-sm flex items-center justify-center">
                  <QrCode className="text-foreground text-xl" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono">TUR-2024-003</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
