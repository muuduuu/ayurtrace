import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, QrCode, Shield, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AyurTrace</span>
          </div>
          <Button 
            onClick={() => window.location.href = '/login'}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Complete Ayurvedic
            <br />
            <span className="text-primary">Traceability System</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Track your Ayurvedic products from farm to consumer with blockchain-powered 
            transparency, IoT monitoring, and QR code verification.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/login'}
            className="bg-primary text-primary-foreground hover:opacity-90 text-lg px-8 py-3"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">QR Code Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Instant product verification and complete traceability with QR codes
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">IoT Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                Real-time temperature, humidity, and storage condition monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Blockchain Security</h3>
              <p className="text-sm text-muted-foreground">
                Immutable records and tamper-proof data integrity
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Assurance</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive quality scoring and compliance reporting
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Demo Section */}
        <div className="bg-card rounded-lg border border-border p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to revolutionize your Ayurvedic supply chain?</h2>
          <p className="text-muted-foreground mb-6">
            Join farmers, collectors, and manufacturers already using AyurTrace for complete transparency.
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = '/login'}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-testid="button-start-tracking"
          >
            Start Tracking Now
          </Button>
        </div>
      </main>
    </div>
  );
}
