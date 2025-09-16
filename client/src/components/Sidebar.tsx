import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Leaf, 
  BarChart3, 
  Package, 
  Thermometer, 
  QrCode, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  X
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Batch Tracking", href: "/batch-tracking", icon: Package },
  { name: "Sensor Data", href: "/sensor-data", icon: Thermometer },
  { name: "QR Scanner", href: "/qr-scanner", icon: QrCode },
  { name: "Farmers & Collectors", href: "/farmers", icon: Users },
  { name: "Compliance Reports", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-card border border-border lg:hidden"
          data-testid="button-mobile-menu"
        >
          <Leaf className="w-5 h-5 text-primary" />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">AyurTrace</span>
          </div>
          {isMobile && (
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-muted"
              data-testid="button-close-sidebar"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          )}
        </div>

        <nav className="px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <a 
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  onClick={() => isMobile && setIsOpen(false)}
                  data-testid={`link-${item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          })}
          
          <div className="pt-4 border-t border-border">
            <Link href="/settings">
              <a 
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                onClick={() => isMobile && setIsOpen(false)}
                data-testid="link-settings"
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </a>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}
