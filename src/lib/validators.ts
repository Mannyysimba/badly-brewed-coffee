import { z } from "zod";

export const productInput = z
  .object({
    type: z.enum(["drink", "bean"]),
    name: z.string().min(1).max(120),
    price: z.coerce.number().min(0),
    cost: z.coerce.number().min(0),
    description: z.string().max(1000).optional().nullable(),
    imageUrl: z.string().url().optional().nullable().or(z.literal("")),
    availability: z.coerce.boolean().default(true),
    stockLevel: z.coerce.number().int().min(0).default(0),
    origin: z.string().max(80).optional().nullable(),
    roastLevel: z.string().max(40).optional().nullable(),
    hasMilk: z.coerce.boolean().default(false),
  })
  .refine((v) => v.type !== "bean" || (v.origin && v.roastLevel), {
    message: "Beans need origin and roast level",
    path: ["origin"],
  });

export const promoInput = z.object({
  code: z.string().min(2).max(30).transform((s) => s.toUpperCase()),
  percentOff: z.coerce.number().min(1).max(100),
  minOrder: z.coerce.number().min(0).default(0),
  eligibleType: z.enum(["all", "drink", "bean"]).default("all"),
  startsAt: z.string(),
  endsAt: z.string(),
});

export const refundDecision = z.object({
  status: z.enum(["approved", "rejected"]),
});

export const refundRequest = z.object({
  orderId: z.coerce.number().int().positive(),
  orderItemId: z.coerce.number().int().positive().optional(),
  reason: z.enum(["defective", "wrong_item", "quality", "customer_request", "damaged"]),
  note: z.string().max(500).optional(),
  amount: z.coerce.number().min(0),
});

export const cartItem = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1),
  milkType: z.enum(["whole", "oat", "almond", "skim", "none"]).optional(),
});

export const checkoutInput = z.object({
  items: z.array(cartItem).min(1),
  promoCode: z.string().optional().nullable(),
});

export const employeeInput = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["barista", "manager", "admin"]),
  password: z.string().min(4),
});

export const employeeUpdate = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["barista", "manager", "admin"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
  password: z.string().min(4).optional(),
});
