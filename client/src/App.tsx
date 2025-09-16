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
import LoginPage from "@/pages/login"; // ⬅️ add this

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={LoginPage} />

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
