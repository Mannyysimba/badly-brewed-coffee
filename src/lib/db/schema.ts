import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["customer", "barista", "manager", "admin"] }).notNull(),
  status: text("status", { enum: ["active", "suspended"] }).notNull().default("active"),
  loyaltyNumber: text("loyalty_number"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type", { enum: ["drink", "bean"] }).notNull(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  cost: real("cost").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  availability: integer("availability", { mode: "boolean" }).notNull().default(true),
  stockLevel: integer("stock_level").notNull().default(0),
  origin: text("origin"),
  roastLevel: text("roast_level"),
  hasMilk: integer("has_milk", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  referenceId: text("reference_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: text("status", {
    enum: ["pending", "in_progress", "ready", "collected", "cancelled"],
  }).notNull().default("pending"),
  totalPrice: real("total_price").notNull(),
  totalCost: real("total_cost").notNull(),
  promoCode: text("promo_code"),
  discountAmount: real("discount_amount").notNull().default(0),
  baristaId: integer("barista_id").references(() => users.id),
  placedAt: integer("placed_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  milkType: text("milk_type", { enum: ["whole", "oat", "almond", "skim", "none"] }),
});

export const refunds = sqliteTable("refunds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => orders.id),
  orderItemId: integer("order_item_id").references(() => orderItems.id),
  userId: integer("user_id").notNull().references(() => users.id),
  reason: text("reason", {
    enum: ["defective", "wrong_item", "quality", "customer_request", "damaged"],
  }).notNull(),
  note: text("note"),
  amount: real("amount").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  processedBy: integer("processed_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  processedAt: integer("processed_at", { mode: "timestamp" }),
});

export const promoCodes = sqliteTable("promo_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  percentOff: real("percent_off").notNull(),
  minOrder: real("min_order").notNull().default(0),
  eligibleType: text("eligible_type", { enum: ["all", "drink", "bean"] }).notNull().default("all"),
  startsAt: integer("starts_at", { mode: "timestamp" }).notNull(),
  endsAt: integer("ends_at", { mode: "timestamp" }).notNull(),
  usageCount: integer("usage_count").notNull().default(0),
  totalDiscountGiven: real("total_discount_given").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
});

export const favorites = sqliteTable(
  "favorites",
  {
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.productId] }) })
);

export const auditLogs = sqliteTable("audit_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorId: integer("actor_id").references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Refund = typeof refunds.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
