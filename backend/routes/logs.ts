import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq, and, gte, lte, desc, count, ilike, or } from "drizzle-orm";
import { db } from "../db";
import { activityLogs, guestRegistrationLogs } from "../db/schema";
import { activityLogQuerySchema } from "../types";
import { authMiddleware, adminOnly } from "../middleware/auth";

const logsRouter = new Hono();

// Apply auth and admin middleware
logsRouter.use("*", authMiddleware, adminOnly);

// Get activity logs
logsRouter.get(
  "/",
  zValidator("query", activityLogQuerySchema),
  async (c) => {
    const { page, limit, userId, action, startDate, endDate } = c.req.valid("query");
    const offset = (page - 1) * limit;

    try {
      const conditions = [];

      if (userId) {
        conditions.push(eq(activityLogs.userId, userId));
      }

      if (action) {
        conditions.push(ilike(activityLogs.action, `%${action}%`));
      }

      if (startDate) {
        conditions.push(gte(activityLogs.createdAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(activityLogs.createdAt, new Date(endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const logs = await db
        .select()
        .from(activityLogs)
        .where(whereClause)
        .orderBy(desc(activityLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const result = await db
        .select({ total: count() })
        .from(activityLogs)
        .where(whereClause);

      const total = result[0]?.total ?? 0;

      return c.json({
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get logs error:", error);
      return c.json({ success: false, message: "เกิดข้อผิดพลาด" }, 500);
    }
  }
);

// Get activity stats
logsRouter.get("/stats", async (c) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Today's activities
    const [todayStats] = await db
      .select({ total: count() })
      .from(activityLogs)
      .where(gte(activityLogs.createdAt, today));

    // Week's activities
    const [weekStats] = await db
      .select({ total: count() })
      .from(activityLogs)
      .where(gte(activityLogs.createdAt, weekAgo));

    // Login count today
    const [loginStats] = await db
      .select({ total: count() })
      .from(activityLogs)
      .where(
        and(
          gte(activityLogs.createdAt, today),
          eq(activityLogs.action, "LOGIN")
        )
      );

    return c.json({
      success: true,
      data: {
        todayActivities: todayStats?.total,
        weekActivities: weekStats?.total,
        todayLogins: loginStats?.total,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return c.json({ success: false, message: "เกิดข้อผิดพลาด" }, 500);
  }
});

// Get guest registration logs
logsRouter.get(
  "/guest-registrations",
  zValidator("query", activityLogQuerySchema),
  async (c) => {
    const { page, limit, action, startDate, endDate } = c.req.valid("query");
    const offset = (page - 1) * limit;

    try {
      const conditions = [];

      if (action) {
        conditions.push(ilike(guestRegistrationLogs.action, `%${action}%`));
      }

      if (startDate) {
        conditions.push(gte(guestRegistrationLogs.createdAt, new Date(startDate)));
      }

      if (endDate) {
        conditions.push(lte(guestRegistrationLogs.createdAt, new Date(endDate)));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const logs = await db
        .select()
        .from(guestRegistrationLogs)
        .where(whereClause)
        .orderBy(desc(guestRegistrationLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const result = await db
        .select({ total: count() })
        .from(guestRegistrationLogs)
        .where(whereClause);

      const total = result[0]?.total ?? 0;

      return c.json({
        success: true,
        data: {
          logs,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get guest registration logs error:", error);
      return c.json({ success: false, message: "เกิดข้อผิดพลาด" }, 500);
    }
  }
);

export default logsRouter;