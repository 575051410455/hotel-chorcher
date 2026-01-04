// src/routes/_admin.tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { userQueryOptions } from "@/lib/api";

export const Route = createFileRoute("/_admin")({
  beforeLoad: async ({ context }) => {
    try {
      // เช็ค auth ด้วย API
      const userData = await context.queryClient.ensureQueryData(userQueryOptions);

      console.log("[_admin beforeLoad] User data:", userData);

      // ส่ง user data ไปให้ child routes
      return {
        user: userData?.data,
      };
    } catch (error) {
      console.error("[_admin beforeLoad] Error:", error);
      // ถ้า 401 → redirect ไป login
      throw redirect({ to: "/login" });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}