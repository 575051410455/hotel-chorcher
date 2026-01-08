import { pgTable, text, timestamp, uuid, varchar, boolean, pgEnum, integer, decimal, jsonb, index, serial } from "drizzle-orm/pg-core";

// Role enum
export const roleEnum = pgEnum("role", ["admin", "manager", "staff", "user", "sales", "salescoordinator", "frontoffice", "housekeeping"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("user"),
  department: varchar("department", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  userName: varchar("user_name", { length: 255 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Refresh tokens table
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// Guests table
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  regNumber: text("reg_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  gender: text("gender"),
  passportNo: text("passport_no"),
  nationality: text("nationality"),
  birthDate: text("birth_date"),
  checkOutDate: text("check_out_date"),
  phoneNo: text("phone_no"),
  flightNumber: text("flight_number"),
  guest2FirstName: text("guest2_first_name"),
  guest2MiddleName: text("guest2_middle_name"),
  guest2LastName: text("guest2_last_name"),
  roomNumber: text("room_number"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  checkedIn: boolean("checked_in").default(false).notNull(),
});

// Guest registration logs table
export const guestRegistrationLogs = pgTable("guest_registration_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: integer("guest_id").references(() => guests.id, { onDelete: "cascade" }),
  guestName: varchar("guest_name", { length: 255 }).notNull(),
  regNumber: text("reg_number").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  action: varchar("action", { length: 100 }).notNull(), // "REGISTRATION", "CHECK_IN", "CHECK_OUT"
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});



// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;

// Types for Guests table
export type GuestTable = typeof guests;
export type GuestInsert = typeof guests.$inferInsert;
export type GuestSelect = typeof guests.$inferSelect;

// Types for Guest Registration Logs table
export type GuestRegistrationLog = typeof guestRegistrationLogs.$inferSelect;
export type NewGuestRegistrationLog = typeof guestRegistrationLogs.$inferInsert;