// client/src/pages/qr.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Search } from "lucide-react";

export default function QREntryPage() {
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");

  function go() {
    const c = code.trim();
    if (!c) return;
    setLocation(`/qr/${encodeURIComponent(c)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Trace a Product</h1>
            <p className="text-muted-foreground">
              Scan a QR code or enter the tracking ID to view provenance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. AYU-12AB34CD"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
              />
              <Button onClick={go} className="shrink-0">
                <Search className="w-4 h-4 mr-1" />
                Track
              </Button>
            </div>

            {/* Optional: add real scanning later */}
            <Button
              variant="outline"
              onClick={() => alert("Camera scanning coming soon")}
            >
              <QrCode className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Tip: if your QR looks like <span className="font-medium">AYU-XXXXXXXX</span>,
            paste it above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
