import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import bcrypt from "bcryptjs";
import * as schema from "../src/lib/db/schema";

const sqlite = new Database(process.env.DATABASE_URL || "./data/bbc.db");
sqlite.pragma("foreign_keys = ON");
const db = drizzle(sqlite, { schema });

function hash(pw: string) {
  return bcrypt.hashSync(pw, 10);
}

function daysAgo(n: number, extraHours = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(9 + extraHours, 0, 0, 0);
  return d;
}

function ref() {
  return "BBC-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function main() {
  console.log("[seed] clearing tables...");
  sqlite.exec(`
    DELETE FROM audit_logs;
    DELETE FROM favorites;
    DELETE FROM refunds;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM promo_codes;
    DELETE FROM products;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);

  console.log("[seed] users...");
  const [customer, barista, manager, admin, extra1, extra2, extra3] = db
    .insert(schema.users)
    .values([
      {
        email: "customer@test.com",
        name: "Casey Customer",
        passwordHash: hash("customer"),
        role: "customer",
        loyaltyNumber: "LOY-00001",
      },
      {
        email: "barista@test.com",
        name: "Benji Barista",
        passwordHash: hash("barista"),
        role: "barista",
      },
      {
        email: "manager@test.com",
        name: "Mona Manager",
        passwordHash: hash("manager"),
        role: "manager",
      },
      {
        email: "admin@test.com",
        name: "Addy Admin",
        passwordHash: hash("admin"),
        role: "admin",
      },
      {
        email: "jamie@test.com",
        name: "Jamie Regular",
        passwordHash: hash("customer"),
        role: "customer",
        loyaltyNumber: "LOY-00002",
      },
      {
        email: "sam@test.com",
        name: "Sam Stopby",
        passwordHash: hash("customer"),
        role: "customer",
        loyaltyNumber: "LOY-00003",
      },
      {
        email: "lee@test.com",
        name: "Lee Latte",
        passwordHash: hash("customer"),
        role: "customer",
        loyaltyNumber: "LOY-00004",
      },
    ])
    .returning()
    .all();

  console.log("[seed] products...");
  const drinks = db
    .insert(schema.products)
    .values([
      {
        type: "drink",
        name: "Latte",
        price: 4.5,
        cost: 1.2,
        description: "Espresso mellowed with steamed milk and a thin layer of foam.",
        imageUrl: "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=640",
        hasMilk: true,
        stockLevel: 999,
      },
      {
        type: "drink",
        name: "Americano",
        price: 3.8,
        cost: 0.9,
        description: "Double shot of espresso, diluted with hot water.",
        imageUrl: "https://images.unsplash.com/photo-1494314671902-399b18174975?w=640",
        hasMilk: false,
        stockLevel: 999,
      },
      {
        type: "drink",
        name: "Cappuccino",
        price: 4.2,
        cost: 1.1,
        description: "Equal parts espresso, steamed milk and foam.",
        imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=640",
        hasMilk: true,
        stockLevel: 999,
      },
      {
        type: "drink",
        name: "Flat White",
        price: 4.6,
        cost: 1.25,
        description: "Rich espresso topped with silky microfoam.",
        imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=640",
        hasMilk: true,
        stockLevel: 999,
      },
      {
        type: "drink",
        name: "Cortado",
        price: 4.3,
        cost: 1.15,
        description: "Equal parts espresso and warm milk, served in a gibraltar.",
        imageUrl: "https://images.unsplash.com/photo-1593443320739-77f74939d0da?w=640",
        hasMilk: true,
        stockLevel: 999,
      },
      {
        type: "drink",
        name: "Mocha",
        price: 4.7,
        cost: 1.45,
        description: "Espresso, chocolate and steamed milk, finished with foam.",
        imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=640",
        hasMilk: true,
        stockLevel: 999,
      },
    ])
    .returning()
    .all();

  const beans = db
    .insert(schema.products)
    .values([
      {
        type: "bean",
        name: "Ethiopian Yirgacheffe",
        price: 18.5,
        cost: 8.2,
        description: "Bright, floral, citrus-forward beans from the Gedeo zone.",
        imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=640",
        origin: "Ethiopia",
        roastLevel: "Light",
        stockLevel: 42,
      },
      {
        type: "bean",
        name: "Colombian Supremo",
        price: 16.0,
        cost: 7.1,
        description: "Classic balanced cup with caramel sweetness and soft acidity.",
        imageUrl: "https://images.unsplash.com/photo-1559525839-d9acfd3051a2?w=640",
        origin: "Colombia",
        roastLevel: "Medium",
        stockLevel: 58,
      },
      {
        type: "bean",
        name: "Brazilian Santos",
        price: 14.5,
        cost: 6.0,
        description: "Low-acid, nutty, chocolatey — the perfect espresso base.",
        imageUrl: "https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=640",
        origin: "Brazil",
        roastLevel: "Medium-Dark",
        stockLevel: 8,
      },
      {
        type: "bean",
        name: "Kenyan AA",
        price: 19.9,
        cost: 9.0,
        description: "Blackcurrant, grapefruit, wine-like body. Award-grade.",
        imageUrl: "https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=640",
        origin: "Kenya",
        roastLevel: "Medium",
        stockLevel: 21,
      },
    ])
    .returning()
    .all();

  const allProducts = [...drinks, ...beans];

  console.log("[seed] promo codes...");
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const past60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  db.insert(schema.promoCodes)
    .values([
      {
        code: "WELCOME10",
        percentOff: 10,
        minOrder: 0,
        eligibleType: "all",
        startsAt: past60,
        endsAt: in30,
        usageCount: 4,
        totalDiscountGiven: 6.2,
      },
      {
        code: "SUMMER15",
        percentOff: 15,
        minOrder: 10,
        eligibleType: "drink",
        startsAt: past60,
        endsAt: in30,
        usageCount: 2,
        totalDiscountGiven: 3.1,
      },
    ])
    .run();

  console.log("[seed] orders...");
  const customers = [customer, extra1, extra2, extra3];
  const statuses: Array<"pending" | "in_progress" | "ready" | "collected"> = [
    "collected",
    "collected",
    "collected",
    "collected",
    "collected",
    "collected",
    "collected",
    "collected",
    "ready",
    "in_progress",
    "pending",
    "pending",
    "collected",
    "collected",
    "in_progress",
  ];

  for (let i = 0; i < 15; i++) {
    const dayOffset = Math.floor(Math.random() * 30);
    const placedAt = daysAgo(dayOffset, Math.floor(Math.random() * 8));
    const u = customers[i % customers.length];
    const itemCount = 1 + Math.floor(Math.random() * 3);
    const picked = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, itemCount);
    const items = picked.map((p) => ({
      product: p,
      qty: 1 + Math.floor(Math.random() * 2),
      milk:
        p.type === "drink" && p.hasMilk
          ? (["whole", "oat", "almond", "skim"] as const)[Math.floor(Math.random() * 4)]
          : ("none" as const),
    }));
    const totalPrice = items.reduce((s, it) => s + it.product.price * it.qty, 0);
    const totalCost = items.reduce((s, it) => s + it.product.cost * it.qty, 0);
    const applyPromo = i % 5 === 0;
    const discount = applyPromo ? totalPrice * 0.1 : 0;
    const status = statuses[i];

    const [order] = db
      .insert(schema.orders)
      .values({
        referenceId: ref(),
        userId: u.id,
        status,
        totalPrice: totalPrice - discount,
        totalCost,
        promoCode: applyPromo ? "WELCOME10" : null,
        discountAmount: discount,
        baristaId: status !== "pending" ? barista.id : null,
        placedAt,
        completedAt: status === "collected" ? placedAt : null,
      })
      .returning()
      .all();

    db.insert(schema.orderItems)
      .values(
        items.map((it) => ({
          orderId: order.id,
          productId: it.product.id,
          quantity: it.qty,
          unitPrice: it.product.price,
          milkType: it.milk,
        }))
      )
      .run();
  }

  console.log("[seed] refunds...");
  const collectedOrders = db
    .select()
    .from(schema.orders)
    .all()
    .filter((o) => o.status === "collected")
    .slice(0, 3);

  if (collectedOrders.length >= 3) {
    const items0 = db
      .select()
      .from(schema.orderItems)
      .all()
      .filter((oi) => oi.orderId === collectedOrders[0].id);
    const items1 = db
      .select()
      .from(schema.orderItems)
      .all()
      .filter((oi) => oi.orderId === collectedOrders[1].id);
    const items2 = db
      .select()
      .from(schema.orderItems)
      .all()
      .filter((oi) => oi.orderId === collectedOrders[2].id);

    db.insert(schema.refunds)
      .values([
        {
          orderId: collectedOrders[0].id,
          orderItemId: items0[0]?.id,
          userId: collectedOrders[0].userId,
          reason: "quality",
          note: "Espresso tasted burnt.",
          amount: items0[0]?.unitPrice ?? 4.5,
          status: "approved",
          processedBy: manager.id,
          processedAt: new Date(collectedOrders[0].placedAt.getTime() + 60 * 60 * 1000),
        },
        {
          orderId: collectedOrders[1].id,
          orderItemId: items1[0]?.id,
          userId: collectedOrders[1].userId,
          reason: "wrong_item",
          note: "Ordered oat milk, got whole.",
          amount: items1[0]?.unitPrice ?? 4.2,
          status: "pending",
        },
        {
          orderId: collectedOrders[2].id,
          orderItemId: items2[0]?.id,
          userId: collectedOrders[2].userId,
          reason: "defective",
          note: "Cup was cracked.",
          amount: items2[0]?.unitPrice ?? 4.3,
          status: "pending",
        },
      ])
      .run();
  }

  console.log("[seed] favorites...");
  db.insert(schema.favorites)
    .values([
      { userId: customer.id, productId: drinks[0].id },
      { userId: customer.id, productId: beans[0].id },
      { userId: extra1.id, productId: drinks[3].id },
    ])
    .run();

  console.log("[seed] done ✓");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
