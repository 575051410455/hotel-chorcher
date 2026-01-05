import { z } from "zod";


// Role enum
export const roleSchema = z.enum(["admin", "manager", "staff", "user", "sales", "salescoordinator", "frontoffice", "housekeeping"]);
export type Role = z.infer<typeof roleSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Register/Create user schema
export const createUserSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  fullName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  role: roleSchema.optional().default("user"),
  department: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

// Update user schema
export const updateUserSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง").optional(),
  fullName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").optional(),
  role: roleSchema.optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// Change password schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "รหัสผ่านปัจจุบันต้องมีอย่างน้อย 6 ตัวอักษร"),
  newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string().min(6, "ยืนยันรหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Admin reset password schema
export const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
});
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token จำเป็น"),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

// Query params schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: roleSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["createdAt", "fullName", "email", "role"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

// Activity log query schema
export const activityLogQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  userId: z.string().uuid().optional(),
  action: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type ActivityLogQueryInput = z.infer<typeof activityLogQuerySchema>;

// ID param schema (for guests - number ID)
export const idParamSchema = z.object({
  id: z.coerce.number(),
});

// User ID param schema (for users - UUID string)
export const userIdParamSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});




// Guest schemas
export const guestSchema = z.object({
  id: z.number(),
  regNumber: z.string(),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().nullable().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().nullable().optional(),
  passportNo: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  checkOutDate: z.string().nullable().optional(),
  phoneNo: z.string().nullable().optional(),
  flightNumber: z.string().nullable().optional(),
  guest2FirstName: z.string().nullable().optional(),
  guest2MiddleName: z.string().nullable().optional(),
  guest2LastName: z.string().nullable().optional(),
  roomNumber: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  createdAt: z.string(),
  checkedIn: z.boolean().default(false),
});

export const createGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().nullable().optional(),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().nullable().optional(),
  passportNo: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  checkOutDate: z.string().nullable().optional(),
  phoneNo: z.string().nullable().optional(),
  flightNumber: z.string().nullable().optional(),
  guest2FirstName: z.string().nullable().optional(),
  guest2MiddleName: z.string().nullable().optional(),
  guest2LastName: z.string().nullable().optional(),
  roomNumber: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});

export const updateGuestSchema = z.object({
  firstName: z.string().min(1).optional(),
  middleName: z.string().nullable().optional(),
  lastName: z.string().min(1).optional(),
  gender: z.string().nullable().optional(),
  passportNo: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  birthDate: z.string().nullable().optional(),
  checkOutDate: z.string().nullable().optional(),
  phoneNo: z.string().nullable().optional(),
  flightNumber: z.string().nullable().optional(),
  guest2FirstName: z.string().nullable().optional(),
  guest2MiddleName: z.string().nullable().optional(),
  guest2LastName: z.string().nullable().optional(),
  roomNumber: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  checkedIn: z.boolean().optional(),
});

// Query params schemas
export const guestQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "checkedIn", "notCheckedIn"]).optional().default("all"),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(50),
});


// Response schemas
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  });


 

// Inferred types from Zod schemas
export type Guest = z.infer<typeof guestSchema>;
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type GuestQuery = z.infer<typeof guestQuerySchema>;
export type IdParam = z.infer<typeof idParamSchema>;

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// API Error type
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, string[]>;
}