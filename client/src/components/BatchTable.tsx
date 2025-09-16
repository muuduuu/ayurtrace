import { useQuery } from "@tanstack/react-query";
import type { Batch } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "lucide-react";

interface BatchTableProps {
  showAll?: boolean;
}

export default function BatchTable({ showAll = false }: BatchTableProps) {
  const { data: batches, isLoading } = useQuery<Batch[]>({
    queryKey: ["/api/batches"],
  });

  const displayBatches = showAll ? batches : batches?.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-secondary/10 text-secondary";
      case "drying":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Batches</span>
            <div className="animate-pulse w-16 h-4 bg-muted rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-8 h-8 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="w-24 h-4 bg-muted rounded" />
                  <div className="w-32 h-3 bg-muted rounded" />
                </div>
                <div className="w-16 h-6 bg-muted rounded-full" />
                <div className="w-20 h-8 bg-muted rounded" />
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
          <span>Active Batches</span>
          {!showAll && (
            <Button variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium">
              View all
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayBatches && displayBatches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Batch ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Quality</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayBatches.map((batch) => (
                  <tr 
                    key={batch.id} 
                    className="border-b border-border hover:bg-muted/50"
                    data-testid={`batch-row-${batch.batchNumber}`}
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">{batch.batchNumber}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-muted rounded object-cover" />
                        <span className="font-medium">
                          {batch.productId === "turmeric" ? "Turmeric" : 
                           batch.productId === "ashwagandha" ? "Ashwagandha" : 
                           batch.productId === "neem" ? "Neem" : "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={`${getStatusColor(batch.status || 'unknown')} capitalize`}>
                        {batch.status || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{batch.qualityScore || "N/A"}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary hover:text-primary/80"
                        data-testid={`button-view-qr-${batch.batchNumber}`}
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        View QR
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No batches found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
