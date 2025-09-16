import {
  users,
  farms,
  products,
  batches,
  collectionEvents,
  processingEvents,
  sensorData,
  qrScanLogs,
  type User,
  type UpsertUser,
  type InsertFarm,
  type Farm,
  type InsertProduct,
  type Product,
  type InsertBatch,
  type Batch,
  type InsertCollectionEvent,
  type CollectionEvent,
  type InsertProcessingEvent,
  type ProcessingEvent,
  type InsertSensorData,
  type SensorData,
  type InsertQrScanLog,
  type QrScanLog,
  type BatchStatus,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Farm operations
  createFarm(farm: InsertFarm): Promise<Farm>;
  getFarm(id: string): Promise<Farm | undefined>;
  getFarmsByUser(userId: string): Promise<Farm[]>;

  // Product operations
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: string): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;

  // Batch operations
  createBatch(batch: InsertBatch): Promise<Batch>;
  getBatch(id: string): Promise<Batch | undefined>;
  getBatchByNumber(batchNumber: string): Promise<Batch | undefined>;
  getBatchByQrCode(qrCode: string): Promise<Batch | undefined>;
  getAllBatches(): Promise<Batch[]>;
  updateBatchStatus(id: string, status: BatchStatus): Promise<Batch | undefined>;
  updateBatchQrCode(id: string, qrCode: string): Promise<Batch | undefined>;

  // Collection event operations
  createCollectionEvent(event: InsertCollectionEvent): Promise<CollectionEvent>;
  getCollectionEventsByBatch(batchId: string): Promise<CollectionEvent[]>;

  // Processing event operations
  createProcessingEvent(event: InsertProcessingEvent): Promise<ProcessingEvent>;
  getProcessingEventsByBatch(batchId: string): Promise<ProcessingEvent[]>;

  // Sensor data operations
  createSensorData(data: InsertSensorData): Promise<SensorData>;
  getLatestSensorData(facilityId?: string): Promise<SensorData[]>;
  getSensorDataByBatch(batchId: string): Promise<SensorData[]>;

  // QR scan log operations
  createQrScanLog(log: InsertQrScanLog): Promise<QrScanLog>;
  getQrScanLogsByBatch(batchId: string): Promise<QrScanLog[]>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    activeBatches: number;
    connectedSensors: number;
    qrScansToday: number;
    qualityScore: number;
  }>;

  // Traceability data
  getBatchTraceability(qrCode: string): Promise<{
    batch: Batch;
    product: Product;
    farm: Farm;
    collectionEvents: CollectionEvent[];
    processingEvents: ProcessingEvent[];
    sensorData: SensorData[];
  } | null>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Farm operations
  async createFarm(farm: InsertFarm): Promise<Farm> {
    const [newFarm] = await db.insert(farms).values(farm).returning();
    return newFarm;
  }

  async getFarm(id: string): Promise<Farm | undefined> {
    const [farm] = await db.select().from(farms).where(eq(farms.id, id));
    return farm;
  }

  async getFarmsByUser(userId: string): Promise<Farm[]> {
    return await db.select().from(farms).where(eq(farms.farmerId, userId));
  }

  // Product operations
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  // Batch operations
  async createBatch(batch: InsertBatch): Promise<Batch> {
    const [newBatch] = await db.insert(batches).values(batch).returning();
    return newBatch;
  }

  async getBatch(id: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch;
  }

  async getBatchByNumber(batchNumber: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.batchNumber, batchNumber));
    return batch;
  }

  async getBatchByQrCode(qrCode: string): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.qrCode, qrCode));
    return batch;
  }

  async getAllBatches(): Promise<Batch[]> {
    return await db.select().from(batches).orderBy(desc(batches.createdAt));
  }

  async updateBatchStatus(id: string, status: BatchStatus): Promise<Batch | undefined> {
    const [updatedBatch] = await db
      .update(batches)
      .set({ status, updatedAt: new Date() })
      .where(eq(batches.id, id))
      .returning();
    return updatedBatch;
  }

  async updateBatchQrCode(id: string, qrCode: string): Promise<Batch | undefined> {
    const [updatedBatch] = await db
      .update(batches)
      .set({ qrCode, updatedAt: new Date() })
      .where(eq(batches.id, id))
      .returning();
    return updatedBatch;
  }

  // Collection event operations
  async createCollectionEvent(event: InsertCollectionEvent): Promise<CollectionEvent> {
    const [newEvent] = await db.insert(collectionEvents).values(event).returning();
    return newEvent;
  }

  async getCollectionEventsByBatch(batchId: string): Promise<CollectionEvent[]> {
    return await db
      .select()
      .from(collectionEvents)
      .where(eq(collectionEvents.batchId, batchId))
      .orderBy(desc(collectionEvents.collectionDate));
  }

  // Processing event operations
  async createProcessingEvent(event: InsertProcessingEvent): Promise<ProcessingEvent> {
    const [newEvent] = await db.insert(processingEvents).values(event).returning();
    return newEvent;
  }

  async getProcessingEventsByBatch(batchId: string): Promise<ProcessingEvent[]> {
    return await db
      .select()
      .from(processingEvents)
      .where(eq(processingEvents.batchId, batchId))
      .orderBy(desc(processingEvents.processDate));
  }

  // Sensor data operations
  async createSensorData(data: InsertSensorData): Promise<SensorData> {
    const [newData] = await db.insert(sensorData).values(data).returning();
    return newData;
  }

  async getLatestSensorData(facilityId?: string): Promise<SensorData[]> {
    let query = db
      .select()
      .from(sensorData)
      .orderBy(desc(sensorData.timestamp))
      .limit(20);

    if (facilityId) {
      query = query.where(eq(sensorData.facilityId, facilityId)) as any;
    }

    return await query;
  }

  async getSensorDataByBatch(batchId: string): Promise<SensorData[]> {
    return await db
      .select()
      .from(sensorData)
      .where(eq(sensorData.batchId, batchId))
      .orderBy(desc(sensorData.timestamp));
  }

  // QR scan log operations
  async createQrScanLog(log: InsertQrScanLog): Promise<QrScanLog> {
    const [newLog] = await db.insert(qrScanLogs).values(log).returning();
    return newLog;
  }

  async getQrScanLogsByBatch(batchId: string): Promise<QrScanLog[]> {
    return await db
      .select()
      .from(qrScanLogs)
      .where(eq(qrScanLogs.batchId, batchId))
      .orderBy(desc(qrScanLogs.timestamp));
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    activeBatches: number;
    connectedSensors: number;
    qrScansToday: number;
    qualityScore: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [activeBatchesResult] = await db
      .select({ count: count() })
      .from(batches)
      .where(sql`${batches.status} NOT IN ('shipped', 'delivered')`);

    const [connectedSensorsResult] = await db
      .select({ count: count() })
      .from(sensorData)
      .where(sql`${sensorData.timestamp} > NOW() - INTERVAL '1 hour'`);

    const [qrScansResult] = await db
      .select({ count: count() })
      .from(qrScanLogs)
      .where(sql`${qrScanLogs.timestamp} >= ${today}`);

    const [qualityResult] = await db
      .select({ avg: sql<number>`AVG(${batches.qualityScore})` })
      .from(batches)
      .where(sql`${batches.qualityScore} IS NOT NULL`);

    return {
      activeBatches: activeBatchesResult.count,
      connectedSensors: connectedSensorsResult.count,
      qrScansToday: qrScansResult.count,
      qualityScore: qualityResult.avg || 0,
    };
  }

  // Traceability data
  async getBatchTraceability(qrCode: string): Promise<{
    batch: Batch;
    product: Product;
    farm: Farm;
    collectionEvents: CollectionEvent[];
    processingEvents: ProcessingEvent[];
    sensorData: SensorData[];
  } | null> {
    const batch = await this.getBatchByQrCode(qrCode);
    if (!batch) return null;

    const [product, farm, collectionEvents, processingEvents, sensorData] = await Promise.all([
      this.getProduct(batch.productId!),
      this.getFarm(batch.farmId!),
      this.getCollectionEventsByBatch(batch.id),
      this.getProcessingEventsByBatch(batch.id),
      this.getSensorDataByBatch(batch.id),
    ]);

    if (!product || !farm) return null;

    return {
      batch,
      product,
      farm,
      collectionEvents,
      processingEvents,
      sensorData,
    };
  }
}

export const storage = new DatabaseStorage();
