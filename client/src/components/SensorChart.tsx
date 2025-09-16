import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Warehouse } from "lucide-react";
import { useEffect, useState } from "react";

interface SensorChartProps {
  detailed?: boolean;
}

export default function SensorChart({ detailed = false }: SensorChartProps) {
  const [currentSensorData, setCurrentSensorData] = useState({
    temperature: "24.5°C",
    humidity: "45%",
    storageCondition: "Good",
  });

  const { data: sensorData, isLoading } = useQuery({
    queryKey: ["/api/sensor-data/latest"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSensorData({
        temperature: `${(20 + Math.random() * 10).toFixed(1)}°C`,
        humidity: `${Math.floor(40 + Math.random() * 20)}%`,
        storageCondition: Math.random() > 0.8 ? "Warning" : "Good",
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading && !detailed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Real-time Sensor Data</span>
            <div className="animate-pulse w-4 h-4 bg-muted rounded-full" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-muted-foreground rounded" />
                    <div className="w-20 h-4 bg-muted-foreground rounded" />
                  </div>
                  <div className="w-16 h-6 bg-muted-foreground rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Real-time Sensor Data</span>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Thermometer className="w-5 h-5 text-red-500" />
              <span className="font-medium">Temperature</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold" data-testid="sensor-temperature">
                {currentSensorData.temperature}
              </span>
              <div className="text-xs text-green-600">Optimal</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Humidity</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold" data-testid="sensor-humidity">
                {currentSensorData.humidity}
              </span>
              <div className="text-xs text-green-600">Normal</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Warehouse className="w-5 h-5 text-accent" />
              <span className="font-medium">Storage Conditions</span>
            </div>
            <div className="text-right">
              <span className={`text-lg font-semibold ${
                currentSensorData.storageCondition === "Good" ? "text-green-600" : "text-yellow-600"
              }`} data-testid="sensor-storage">
                {currentSensorData.storageCondition}
              </span>
              <div className="text-xs text-muted-foreground">Last updated: 2 min ago</div>
            </div>
          </div>
        </div>

        {detailed && (
          <div className="mt-6 h-64 bg-muted/30 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">
              <Thermometer className="w-6 h-6 mr-2 inline" />
              Detailed sensor trend chart would display here
            </span>
          </div>
        )}

        {!detailed && (
          <div className="mt-6 h-32 bg-muted/30 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">
              <Thermometer className="w-5 h-5 mr-2 inline" />
              Sensor trend chart would display here
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
