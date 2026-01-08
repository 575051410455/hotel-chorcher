import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { Toaster } from "sonner";
import type { QueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface RouterContext {
  queryClient: QueryClient;
  user?: User;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      {/* 3. ใส่ Toaster ไว้ท้ายสุดของ Layout หลัก */}
      <Toaster richColors position="top-right" />
    </>
  ),
})
