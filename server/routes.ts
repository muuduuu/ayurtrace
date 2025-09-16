import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBatchSchema,
  insertCollectionEventSchema,
  insertProcessingEventSchema,
  insertSensorDataSchema,
  insertQrScanLogSchema,
  insertFarmSchema,
  insertProductSchema,
  BATCH_STATUSES,
} from "@shared/schema";
import { randomUUID } from "node:crypto";
const DEV = process.env.LOCAL_DEV === "true";
import { isAuthenticatedLocal as isAuthenticated } from "./localAuth";

export async function registerRoutes(app: Express): Promise<Server> {
function getUserId(req: any) {
  return (req.user as any)?.id ?? null; // localAuth puts { id, email, ... } on req.user
}

  // Auth routes
app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(userId); // if this expects the DB id, you're good
    res.json(user ?? { id: userId, email: (req.user as any).email });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});


  // Dashboard stats
  app.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Farm routes
  app.get("/api/farms", isAuthenticated, async (req: any, res) => {
    try {
const userId = getUserId(req);
if (!userId) return res.status(401).json({ message: "Unauthorized" });
      const farms = await storage.getFarmsByUser(userId);
      res.json(farms);
    } catch (error) {
      console.error("Error fetching farms:", error);
      res.status(500).json({ message: "Failed to fetch farms" });
    }
  });

  app.post("/api/farms", isAuthenticated, async (req: any, res) => {
    try {
const userId = getUserId(req);
if (!userId) return res.status(401).json({ message: "Unauthorized" });
const farmData = insertFarmSchema.parse({ ...req.body, farmerId: userId });
      const farm = await storage.createFarm(farmData);
      res.status(201).json(farm);
    } catch (error) {
      console.error("Error creating farm:", error);
      res.status(500).json({ message: "Failed to create farm" });
    }
  });

  // Batch routes
  app.get("/api/batches", isAuthenticated, async (req, res) => {
    try {
      const batches = await storage.getAllBatches();
      res.json(batches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  app.post("/api/batches", isAuthenticated, async (req: any, res) => {
    try {
      const batchData = insertBatchSchema.parse(req.body);
      const batch = await storage.createBatch(batchData);
      
      // Generate QR code for the batch
      const qrCode = `AYU-${batch.id.slice(-8).toUpperCase()}`;
      await storage.updateBatchQrCode(batch.id, qrCode);
      
      res.status(201).json({ ...batch, qrCode });
    } catch (error) {
      console.error("Error creating batch:", error);
      res.status(500).json({ message: "Failed to create batch" });
    }
  });

  app.get("/api/batches/:id", isAuthenticated, async (req, res) => {
    try {
      const batch = await storage.getBatch(req.params.id);
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      res.json(batch);
    } catch (error) {
      console.error("Error fetching batch:", error);
      res.status(500).json({ message: "Failed to fetch batch" });
    }
  });

  app.patch("/api/batches/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      
      // Validate status
      if (!status || !BATCH_STATUSES.includes(status)) {
        return res.status(400).json({ 
          message: "Invalid status", 
          validStatuses: BATCH_STATUSES 
        });
      }
      
      const batch = await storage.updateBatchStatus(req.params.id, status);
      if (!batch) {
        return res.status(404).json({ message: "Batch not found" });
      }
      res.json(batch);
    } catch (error) {
      console.error("Error updating batch status:", error);
      res.status(500).json({ message: "Failed to update batch status" });
    }
  });

  // Collection event routes
  app.post("/api/collection-events", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
if (!userId) return res.status(401).json({ message: "Unauthorized" });
const eventData = insertCollectionEventSchema.parse({ ...req.body, collectorId: userId });
      const event = await storage.createCollectionEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating collection event:", error);
      res.status(500).json({ message: "Failed to create collection event" });
    }
  });

  app.get("/api/batches/:id/collection-events", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getCollectionEventsByBatch(req.params.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching collection events:", error);
      res.status(500).json({ message: "Failed to fetch collection events" });
    }
  });

  // Processing event routes
  app.post("/api/processing-events", isAuthenticated, async (req: any, res) => {
    try {
const userId = getUserId(req);
if (!userId) return res.status(401).json({ message: "Unauthorized" });
const eventData = insertProcessingEventSchema.parse({ ...req.body, processedBy: userId });      const event = await storage.createProcessingEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating processing event:", error);
      res.status(500).json({ message: "Failed to create processing event" });
    }
  });

  app.get("/api/batches/:id/processing-events", isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getProcessingEventsByBatch(req.params.id);
      res.json(events);
    } catch (error) {
      console.error("Error fetching processing events:", error);
      res.status(500).json({ message: "Failed to fetch processing events" });
    }
  });

  // Sensor data routes
  app.post("/api/sensor-data", async (req, res) => {
    try {
      const sensorData = insertSensorDataSchema.parse(req.body);
      const data = await storage.createSensorData(sensorData);
      res.status(201).json(data);
    } catch (error) {
      console.error("Error creating sensor data:", error);
      res.status(500).json({ message: "Failed to create sensor data" });
    }
  });

  app.get("/api/sensor-data/latest", isAuthenticated, async (req, res) => {
    try {
      const facilityId = req.query.facilityId as string;
      const data = await storage.getLatestSensorData(facilityId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      res.status(500).json({ message: "Failed to fetch sensor data" });
    }
  });

  app.get("/api/batches/:id/sensor-data", isAuthenticated, async (req, res) => {
    try {
      const data = await storage.getSensorDataByBatch(req.params.id);
      res.json(data);
    } catch (error) {
      console.error("Error fetching sensor data:", error);
      res.status(500).json({ message: "Failed to fetch sensor data" });
    }
  });

  // QR code routes
  app.get("/api/qr-provenance/:qrCode", async (req, res) => {
    try {
      const { qrCode } = req.params;
      const traceability = await storage.getBatchTraceability(qrCode);
      
      if (!traceability) {
        return res.status(404).json({ message: "Batch not found" });
      }

      // Log the QR scan
      const userAgent = req.get('User-Agent') || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      
      await storage.createQrScanLog({
        qrCode,
        batchId: traceability.batch.id,
        userAgent,
        ipAddress,
      });

      res.json(traceability);
    } catch (error) {
      console.error("Error fetching traceability data:", error);
      res.status(500).json({ message: "Failed to fetch traceability data" });
    }
  });

  app.get("/api/batches/:id/qr-scans", isAuthenticated, async (req, res) => {
    try {
      const logs = await storage.getQrScanLogsByBatch(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching QR scan logs:", error);
      res.status(500).json({ message: "Failed to fetch QR scan logs" });
    }
  });

  // Simulate IoT sensor data endpoint
  app.post("/api/simulate/sensor-data", async (req, res) => {
    try {
      // Generate random sensor data for simulation
      const facilities = ["A-12", "B-03", "C-07", "D-15"];
      const sensorTypes = ["temperature", "humidity"];
      
      const facilityId = facilities[Math.floor(Math.random() * facilities.length)];
      const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)] as "temperature" | "humidity";
      
      let value: number;
      let unit: string;
      let status: string;
      
      if (sensorType === "temperature") {
        value = 20 + Math.random() * 10; // 20-30°C
        unit = "°C";
        status = value > 30 ? "critical" : value > 28 ? "warning" : "normal";
      } else {
        value = 40 + Math.random() * 20; // 40-60%
        unit = "%";
        status = value > 80 ? "critical" : value > 70 ? "warning" : "normal";
      }

      const sensorData = await storage.createSensorData({
        facilityId,
        sensorType,
        value: value.toString(),
        unit,
        status: status as "normal" | "warning" | "critical",
      });

      res.status(201).json(sensorData);
    } catch (error) {
      console.error("Error simulating sensor data:", error);
      res.status(500).json({ message: "Failed to simulate sensor data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
