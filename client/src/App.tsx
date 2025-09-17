import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import BatchTracking from "@/pages/batch-tracking";
import SensorData from "@/pages/sensor-data";
import QRScanner from "@/pages/qr-scanner";
import LoginPage from "@/pages/login"; // 
import QREntryPage from "@/pages/qr";
import QRDetailsPage from "@/pages/qr-details";
import ComplianceReportPage from "@/pages/ComplianceReportPage";
import AddBatchPage from "./pages/AddBatchPage";


function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={LoginPage} />
      <Route path="/qr" component={QREntryPage} />
      <Route path="/qr/:code" component={QRDetailsPage} />


      {/* Protected routes */}
      <Route path="/dashboard">
        {isLoading ? (
          <div className="p-6">Loading…</div>
        ) : isAuthenticated ? (
          <Dashboard />
        ) : (
          <LoginPage />
        )}
      </Route>

      <Route path="/batch-tracking">
        {isAuthenticated ? <BatchTracking /> : <LoginPage />}
      </Route>
      <Route path="/reports">
        {isAuthenticated ? <ComplianceReportPage /> : <LoginPage />}
      </Route>
      <Route path="/sensor-data">
        {isAuthenticated ? <SensorData /> : <LoginPage />}
      </Route>
      <Route path="/qr-scanner">
        {isAuthenticated ? <QRScanner /> : <LoginPage />}
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
