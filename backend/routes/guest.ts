import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, like, or, and, sql, desc } from "drizzle-orm";
import { db } from "../db";
import { guests } from "../db/schema";
import {
  createGuestSchema,
  updateGuestSchema,
  guestQuerySchema,
  idParamSchema,
} from "../types";
import type { ApiResponse, PaginatedResponse, Guest } from "../types";

// Helper function to transform DB guest to API guest
function transformGuest(g: typeof guests.$inferSelect): Guest {
  return {
    id: g.id,
    regNumber: g.regNumber,
    firstName: g.firstName,
    middleName: g.middleName,
    lastName: g.lastName,
    gender: g.gender,
    passportNo: g.passportNo,
    nationality: g.nationality,
    birthDate: g.birthDate,
    checkOutDate: g.checkOutDate,
    phoneNo: g.phoneNo,
    flightNumber: g.flightNumber,
    guest2FirstName: g.guest2FirstName,
    guest2MiddleName: g.guest2MiddleName,
    guest2LastName: g.guest2LastName,
    image: g.image,
    createdAt: g.createdAt.toISOString(),
    checkedIn: g.checkedIn,
  };
}

const guestsRoute = new Hono()
  // Get all guests with filtering and pagination
  .get("/", zValidator("query", guestQuerySchema), async (c) => {
    const { search, status, page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(guests.firstName, `%${search}%`),
          like(guests.lastName, `%${search}%`),
          like(guests.guest2FirstName, `%${search}%`),
          like(guests.guest2LastName, `%${search}%`),
          like(guests.flightNumber, `%${search}%`),
          like(guests.regNumber, `%${search}%`)
        )
      );
    }

    if (status === "checkedIn") {
      conditions.push(eq(guests.checkedIn, true));
    } else if (status === "notCheckedIn") {
      conditions.push(eq(guests.checkedIn, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(guests)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Get paginated data
    const data = await db
      .select()
      .from(guests)
      .where(whereClause)
      .orderBy(desc(guests.createdAt))
      .limit(limit)
      .offset(offset);

    const transformedData: Guest[] = data.map(transformGuest);

    const response: PaginatedResponse<Guest> = {
      success: true,
      data: transformedData,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    return c.json(response);
  })

  // Get single guest by ID
  .get("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");

    const guest = await db.select().from(guests).where(eq(guests.id, id)).limit(1);

    if (!guest.length) {
      return c.json<ApiResponse>({ success: false, error: "Guest not found" }, 404);
    }

    return c.json<ApiResponse<Guest>>({ success: true, data: transformGuest(guest[0]!) });
  })

  // Create new guest
  .post("/", zValidator("json", createGuestSchema), async (c) => {
    const data = c.req.valid("json");

    // Get next registration number
    const lastGuest = await db
      .select({ regNumber: guests.regNumber })
      .from(guests)
      .orderBy(desc(guests.id))
      .limit(1);

    const latestGuest = lastGuest[0];
    const nextRegNumber = latestGuest
      ? (parseInt(latestGuest.regNumber) + 1).toString()
      : "1";

    const newGuest = await db
      .insert(guests)
      .values({
        ...data,
        regNumber: nextRegNumber,
      })
      .returning();

    const g = newGuest[0];

    if (!g) {
      return c.json<ApiResponse>({ success: false, error: "Failed to create guest" }, 500);
    }

    return c.json<ApiResponse<Guest>>({ success: true, data: transformGuest(g) }, 201);
  })

  // Update guest
  .put("/:id", zValidator("param", idParamSchema), zValidator("json", updateGuestSchema), async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    const existing = await db.select().from(guests).where(eq(guests.id, id)).limit(1);

    if (!existing.length) {
      return c.json<ApiResponse>({ success: false, error: "Guest not found" }, 404);
    }

    const updated = await db
      .update(guests)
      .set(data)
      .where(eq(guests.id, id))
      .returning();

    const g = updated[0];

    if (!g) {
      return c.json<ApiResponse>({ success: false, error: "Failed to update guest" }, 500);
    }

    return c.json<ApiResponse<Guest>>({ success: true, data: transformGuest(g) });
  })

  // Delete guest
  .delete("/:id", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");

    const existing = await db.select().from(guests).where(eq(guests.id, id)).limit(1);

    if (!existing.length) {
      return c.json<ApiResponse>({ success: false, error: "Guest not found" }, 404);
    }

    await db.delete(guests).where(eq(guests.id, id));

    return c.json<ApiResponse>({ success: true });
  })

  // Toggle check-in status
  .patch("/:id/check-in", zValidator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");

    const existing = await db.select().from(guests).where(eq(guests.id, id)).limit(1);

    if (!existing.length) {
      return c.json<ApiResponse>({ success: false, error: "Guest not found" }, 404);
    }

    const updated = await db
      .update(guests)
      .set({ checkedIn: !existing[0]!.checkedIn })
      .where(eq(guests.id, id))
      .returning();

    const g = updated[0];

    if (!g) {
      return c.json<ApiResponse>({ success: false, error: "Failed to toggle check-in" }, 500);
    }

    return c.json<ApiResponse<Guest>>({ success: true, data: transformGuest(g) });
  });

export default guestsRoute;