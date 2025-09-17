import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

export default function AddBatchPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Form states
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [batchDate, setBatchDate] = useState("");
  const [status, setStatus] = useState("Pending");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to create a batch.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
          batchDate,
          status,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Batch Created",
          description: "Your batch has been successfully created.",
          variant: "success",
        });
        navigate("/dashboard"); // Redirect to dashboard or batch list page
      } else {
        toast({
          title: "Error",
          description: data.message || "An error occurred while creating the batch.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an issue with the request.",
        variant: "destructive",
      });
      console.error("Error creating batch:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-lg p-6 bg-card border border-border rounded-md">
        <h2 className="text-2xl font-bold text-foreground mb-6">Create New Batch</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="productId" className="text-sm font-medium text-muted-foreground">
              Product ID
            </label>
            <Input
              id="productId"
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="quantity" className="text-sm font-medium text-muted-foreground">
              Quantity
            </label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="batchDate" className="text-sm font-medium text-muted-foreground">
              Batch Date
            </label>
            <Input
              id="batchDate"
              type="date"
              value={batchDate}
              onChange={(e) => setBatchDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="text-sm font-medium text-muted-foreground">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 bg-muted rounded-md"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <Button type="submit" className="w-full mt-4">
            Create Batch
          </Button>
        </form>
      </div>
    </div>
  );
}
