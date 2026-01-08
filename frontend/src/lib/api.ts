import { hc } from "hono/client";
import { useQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import type { ApiRoutes } from "@backend/app";
import type {
  ApiResponse,
  CreateGuestInput,
  Guest,
  GuestQuery,
  PaginatedResponse,
  UpdateGuestInput,
} from "@backend/types";


// Types
export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  department?: string;
  phone?: string;
}
export interface UpdateUserInput {
  email?: string;
  fullName?: string;
  role?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
}
export interface LogFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}


// Create client with auth headers
const client = hc<ApiRoutes>("/", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    const token = localStorage.getItem("accessToken");
    const headers = new Headers(init?.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(input, {
      ...init,
      headers,
    });
  },
});

export const api = client.api;



async function getCurrentUser() {
  const res = await api.auth.me.$get();
  console.log("[getCurrentUser] Response status:", res.status);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    // console.error("[getCurrentUser] Error response:", res.status, errorData);
    throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
  }

  const data = await res.json();
  // console.log("[getCurrentUser] Success:", data);
  return data;
}

// Get current user
export const userQueryOptions = queryOptions({
  queryKey: ["get-current-user"],
  queryFn: getCurrentUser,
  retry: false,
  staleTime: 1000 * 60 * 5, // 5 minutes
  enabled: !!localStorage.getItem("accessToken"),
});

// Get users list
export const usersQueryOptions = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
}) =>
  queryOptions({
    queryKey: ["users", params],
    queryFn: async () => {
      const res = await api.users.$get({
        query: {
          page: params?.page?.toString(),
          limit: params?.limit?.toString(),
          search: params?.search,
          role: params?.role,
          isActive: params?.isActive?.toString(),
        },
      });
      if (!res.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      }
      return res.json();
    },
  });

// Get single user
export const userByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["user", id],
    queryFn: async () => {
      const res = await api.users[":id"].$get({
        param: { id },
      });
      if (!res.ok) {
        throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      }
      return res.json();
    },
    enabled: !!id,
  });

// Get activity logs
export const logsQueryOptions = (params?: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) =>
  queryOptions({
    queryKey: ["logs", params],
    queryFn: async () => {
      const res = await api.logs.$get({
        query: {
          page: params?.page?.toString(),
          limit: params?.limit?.toString(),
          userId: params?.userId,
          action: params?.action,
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      });
      if (!res.ok) {
        throw new Error("ไม่สามารถดึงข้อมูล logs ได้");
      }
      return res.json();
    },
  });

// Get logs stats
export const logsStatsQueryOptions = queryOptions({
  queryKey: ["logs", "stats"],
  queryFn: async () => {
    const res = await api.logs.stats.$get();
    if (!res.ok) {
      throw new Error("ไม่สามารถดึงข้อมูลสถิติได้");
    }
    return res.json();
  },
});


// Query keys
export const guestKeys = {
  all: ["guests"] as const,
  lists: () => [...guestKeys.all, "list"] as const,
  list: (filters: GuestQuery) => [...guestKeys.lists(), filters] as const,
  details: () => [...guestKeys.all, "detail"] as const,
  detail: (id: number) => [...guestKeys.details(), id] as const,
};

// Fetch guests with filtering
export function useGuests(filters: GuestQuery = {}) {
  return useQuery({
    queryKey: guestKeys.list(filters),
    queryFn: async (): Promise<PaginatedResponse<Guest>> => {
      const res = await api.guests.$get({
        query: {
          search: filters.search || undefined,
          status: filters.status || "all",
          page: String(filters.page || 1),
          limit: String(filters.limit || 50),
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch guests");
      }
      return res.json() as Promise<PaginatedResponse<Guest>>;
    },
  });
}

// Fetch single guest
export function useGuest(id: number) {
  return useQuery({
    queryKey: guestKeys.detail(id),
    queryFn: async (): Promise<Guest> => {
      const res = await api.guests[":id"].$get({
        param: { id: String(id) },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch guest");
      }
      const data = (await res.json()) as ApiResponse<Guest>;
      if (!data.success || !data.data) {
        throw new Error(data.error || "Guest not found");
      }
      return data.data;
    },
    enabled: !!id,
  });
}

// Create guest mutation
export function useCreateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGuestInput): Promise<Guest> => {
      const res = await api.guests.$post({
        json: data,
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Failed to create guest" }));
        throw new Error((errorData as any).error || "Failed to create guest");
      }
      const result = (await res.json()) as ApiResponse<Guest>;
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to create guest");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
    },
  });
}


// Update guest mutation
export function useUpdateGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateGuestInput;
    }): Promise<Guest> => {
      const res = await api.guests[":id"].$put({
        param: { id: String(id) },
        json: data,
      });
      if (!res.ok) {
        throw new Error("Failed to update guest");
      }
      const result = (await res.json()) as ApiResponse<Guest>;
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to update guest");
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(variables.id) });
    },
  });
}

// Delete guest mutation
export function useDeleteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const res = await api.guests[":id"].$delete({
        param: { id: String(id) },
      });
      if (!res.ok) {
        throw new Error("Failed to delete guest");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
    },
  });
}

// Toggle check-in status
export function useToggleCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<Guest> => {
      const res = await api.guests[":id"]["check-in"].$patch({
        param: { id: String(id) },
      });
      if (!res.ok) {
        throw new Error("Failed to toggle check-in status");
      }
      const result = (await res.json()) as ApiResponse<Guest>;
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to toggle check-in");
      }
      return result.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: guestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: guestKeys.detail(id) });
    },
  });
}


// Upload image mutation
export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File): Promise<{ url: string; filename: string }> => {
      const formData = new FormData();
      formData.append("file", file);
      
      // ใช้ fetch ตรงๆ สำหรับ multipart/form-data เพราะ Hono RPC ไม่รองรับ
      const res = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(error.error || "Failed to upload image");
      }
      
      const result = await res.json();
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to upload image");
      }
      return result.data;
    },
  });
}

// Delete image mutation
export function useDeleteImage() {
  return useMutation({
    mutationFn: async (filename: string): Promise<void> => {
      const res = await api.upload[":filename"].$delete({
        param: { filename },
      });
      if (!res.ok) {
        throw new Error("Failed to delete image");
      }
    },
  });
}



// ============================================
// Users
// ============================================

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Hooks
export function useUsers(filters?: UserFilters) {
  return useQuery(usersQueryOptions(filters));
}

export function useUser(id: string) {
  return useQuery(userByIdQueryOptions(id));
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserInput) => {
      const res = await api.users.$post({
        json: data,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "ไม่สามารถสร้างผู้ใช้ได้" }));
        throw new Error((error as any).message || "ไม่สามารถสร้างผู้ใช้ได้");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserInput }) => {
      console.log("[useUpdateUser] Request:", { id, data });
      const res = await api.users[":id"].$put({
        param: { id },
        json: data,
      });
      console.log("[useUpdateUser] Response status:", res.status);
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "ไม่สามารถอัปเดตผู้ใช้ได้" }));
        console.error("[useUpdateUser] Error response:", error);
        throw new Error((error as any).message || "ไม่สามารถอัปเดตผู้ใช้ได้");
      }
      const result = await res.json();
      console.log("[useUpdateUser] Success:", result);
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      const res = await api.users["update-profile"].$put({
        json: data,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "ไม่สามารถอัปเดตโปรไฟล์ได้" }));
        throw new Error((error as any).message || "ไม่สามารถอัปเดตโปรไฟล์ได้");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-current-user"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log("[useDeleteUser] Deleting user:", id);
      const res = await api.users[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "ไม่สามารถลบผู้ใช้ได้" }));
        console.error("[useDeleteUser] Failed:", res.status, error);
        throw new Error((error as any).message || "ไม่สามารถลบผู้ใช้ได้");
      }

      const result = await res.json();
      console.log("[useDeleteUser] Success:", result);
      return result;
    },
    onSuccess: () => {
      // Invalidate all queries that start with ["users"]
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const res = await api.users[":id"]["reset-password"].$post({
        param: { id },
        json: { newPassword },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "ไม่สามารถรีเซ็ตรหัสผ่านได้" }));
        throw new Error((error as any).message || "ไม่สามารถรีเซ็ตรหัสผ่านได้");
      }
      return res.json();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const res = await api.users["change-password"].$post({
        json: data,
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "ไม่สามารถเปลี่ยนรหัสผ่านได้" }));
        throw new Error((error as any).message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
      }
      return res.json();
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.users[":id"]["toggle-active"].$post({
        param: { id },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้" }));
        throw new Error((error as any).message || "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้");
      }
      return res.json();
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
}

// ============================================
// Activity Logs
// ============================================

// Query keys
export const logKeys = {
  all: ["logs"] as const,
  lists: () => [...logKeys.all, "list"] as const,
  list: (filters?: LogFilters) => [...logKeys.lists(), filters] as const,
  stats: () => [...logKeys.all, "stats"] as const,
};

export function useLogs(filters?: LogFilters) {
  return useQuery(logsQueryOptions(filters));
}

export function useLogsStats() {
  return useQuery(logsStatsQueryOptions);
}


