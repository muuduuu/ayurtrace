import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["farmer", "collector", "admin", "consumer"] }).default("consumer"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Farms table
export const farms = pgTable("farms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  location: varchar("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  farmerId: varchar("farmer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products/Herbs table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  scientificName: varchar("scientific_name"),
  description: text("description"),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Batches table
export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: varchar("batch_number").unique().notNull(),
  productId: varchar("product_id").references(() => products.id),
  farmId: varchar("farm_id").references(() => farms.id),
  collectorId: varchar("collector_id").references(() => users.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  unit: varchar("unit").default("kg"),
  harvestDate: timestamp("harvest_date"),
  status: varchar("status", { 
    enum: ["harvested", "collected", "processing", "drying", "grinding", "packaging", "ready", "shipped"] 
  }).default("harvested"),
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  qrCode: varchar("qr_code").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collection events table
export const collectionEvents = pgTable("collection_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => batches.id),
  collectorId: varchar("collector_id").references(() => users.id),
  collectionDate: timestamp("collection_date").defaultNow(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  qualityNotes: text("quality_notes"),
  moistureLevel: decimal("moisture_level", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Processing events table
export const processingEvents = pgTable("processing_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => batches.id),
  processType: varchar("process_type", { 
    enum: ["drying", "grinding", "extraction", "packaging", "quality_check"] 
  }).notNull(),
  processDate: timestamp("process_date").defaultNow(),
  facilityName: varchar("facility_name"),
  processedBy: varchar("processed_by").references(() => users.id),
  parameters: jsonb("parameters"), // Store process-specific parameters
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sensor data table
export const sensorData = pgTable("sensor_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: varchar("batch_id").references(() => batches.id),
  facilityId: varchar("facility_id"), // Storage facility identifier
  sensorType: varchar("sensor_type", { enum: ["temperature", "humidity", "light", "air_quality"] }).notNull(),
  value: decimal("value", { precision: 10, scale: 4 }).notNull(),
  unit: varchar("unit").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  status: varchar("status", { enum: ["normal", "warning", "critical"] }).default("normal"),
});

// QR scan logs table
export const qrScanLogs = pgTable("qr_scan_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  qrCode: varchar("qr_code").notNull(),
  batchId: varchar("batch_id").references(() => batches.id),
  scannedBy: varchar("scanned_by"), // Can be anonymous consumer
  scanLocation: varchar("scan_location"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  farmedBatches: many(farms),
  collectedBatches: many(batches),
  collectionEvents: many(collectionEvents),
  processingEvents: many(processingEvents),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  farmer: one(users, {
    fields: [farms.farmerId],
    references: [users.id],
  }),
  batches: many(batches),
}));

export const productsRelations = relations(products, ({ many }) => ({
  batches: many(batches),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  product: one(products, {
    fields: [batches.productId],
    references: [products.id],
  }),
  farm: one(farms, {
    fields: [batches.farmId],
    references: [farms.id],
  }),
  collector: one(users, {
    fields: [batches.collectorId],
    references: [users.id],
  }),
  collectionEvents: many(collectionEvents),
  processingEvents: many(processingEvents),
  sensorData: many(sensorData),
  qrScanLogs: many(qrScanLogs),
}));

export const collectionEventsRelations = relations(collectionEvents, ({ one }) => ({
  batch: one(batches, {
    fields: [collectionEvents.batchId],
    references: [batches.id],
  }),
  collector: one(users, {
    fields: [collectionEvents.collectorId],
    references: [users.id],
  }),
}));

export const processingEventsRelations = relations(processingEvents, ({ one }) => ({
  batch: one(batches, {
    fields: [processingEvents.batchId],
    references: [batches.id],
  }),
  processor: one(users, {
    fields: [processingEvents.processedBy],
    references: [users.id],
  }),
}));

export const sensorDataRelations = relations(sensorData, ({ one }) => ({
  batch: one(batches, {
    fields: [sensorData.batchId],
    references: [batches.id],
  }),
}));

export const qrScanLogsRelations = relations(qrScanLogs, ({ one }) => ({
  batch: one(batches, {
    fields: [qrScanLogs.batchId],
    references: [batches.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
});

export const insertFarmSchema = createInsertSchema(farms).pick({
  name: true,
  location: true,
  latitude: true,
  longitude: true,
  farmerId: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  scientificName: true,
  description: true,
  imageUrl: true,
});

export const insertBatchSchema = createInsertSchema(batches).pick({
  batchNumber: true,
  productId: true,
  farmId: true,
  collectorId: true,
  quantity: true,
  unit: true,
  harvestDate: true,
  status: true,
  qualityScore: true,
});

export const insertCollectionEventSchema = createInsertSchema(collectionEvents).pick({
  batchId: true,
  collectorId: true,
  collectionDate: true,
  latitude: true,
  longitude: true,
  qualityNotes: true,
  moistureLevel: true,
});

export const insertProcessingEventSchema = createInsertSchema(processingEvents).pick({
  batchId: true,
  processType: true,
  processDate: true,
  facilityName: true,
  processedBy: true,
  parameters: true,
  qualityScore: true,
  notes: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData).pick({
  batchId: true,
  facilityId: true,
  sensorType: true,
  value: true,
  unit: true,
  status: true,
});

export const insertQrScanLogSchema = createInsertSchema(qrScanLogs).pick({
  qrCode: true,
  batchId: true,
  scannedBy: true,
  scanLocation: true,
  userAgent: true,
  ipAddress: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertFarm = z.infer<typeof insertFarmSchema>;
export type Farm = typeof farms.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;
export type InsertCollectionEvent = z.infer<typeof insertCollectionEventSchema>;
export type CollectionEvent = typeof collectionEvents.$inferSelect;
export type InsertProcessingEvent = z.infer<typeof insertProcessingEventSchema>;
export type ProcessingEvent = typeof processingEvents.$inferSelect;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type SensorData = typeof sensorData.$inferSelect;
export type InsertQrScanLog = z.infer<typeof insertQrScanLogSchema>;
export type QrScanLog = typeof qrScanLogs.$inferSelect;

// API Response Types
export type DashboardStats = {
  activeBatches: number;
  connectedSensors: number;
  qrScansToday: number;
  qualityScore: number;
};

export type TraceabilityData = {
  batch: Batch;
  product: Product;
  farm: Farm;
  collectionEvents: CollectionEvent[];
  processingEvents: ProcessingEvent[];
  sensorData: SensorData[];
};

// Batch status enum for validation
export const BATCH_STATUSES = ["harvested", "collected", "processing", "drying", "grinding", "packaging", "ready", "shipped"] as const;
export type BatchStatus = typeof BATCH_STATUSES[number];
export const localCredentials = pgTable("local_credentials", {
  userId: varchar("user_id").primaryKey().references(() => users.id),
  passwordHash: text("password_hash").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
