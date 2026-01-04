import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronUp,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";


interface User {
  fullName: string;
  email: string;
  role: string;
}

interface AppSidebarProps {
  user: User;
  onLogout: () => void;
}

const menuItems = [
  {
    title: "แดชบอร์ด",
    icon: LayoutDashboard,
    href: "/admin",
    roles: ["admin", "manager", "sales", "salescoordinator", "frontoffice", "housekeeping"], // ทุกคนเห็น
  },
  {
    title: "จัดการผู้ใช้",
    icon: Users,
    href: "/users",
    roles: ["admin", "manager"], // เฉพาะ admin และ manager
  },
  {
    title: "ประวัติการใช้งาน",
    icon: FileText,
    href: "/logs",
    roles: ["admin", "manager"], // เฉพาะ admin และ manager
  },
  {
    title: "ตั้งค่า",
    icon: Settings,
    href: "/profile",
    roles: ["admin", "manager", "sales", "salescoordinator", "frontoffice", "housekeeping"], // ทุกคนเห็น
  },
];

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const location = useLocation();

  // Filter menu items based on user role
  const visibleMenuItems = menuItems.filter(item =>
    item.roles.includes(user.role)
  );

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* Header with Logo */}
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <img src="../../public/chorcher.png" alt="Chorcher Logo" className="h-10 w-10" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight">Chorcher Admin</span>
            <span className="text-xs text-muted-foreground">Dashboard</span>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            เมนูหลัก
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-10 gap-3 rounded-lg px-3 transition-colors"
                    >
                      <Link to={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with User Menu */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium">
                  {user.fullName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-[--radix-dropdown-menu-trigger-width]"
          >
            <DropdownMenuItem asChild>
              <Link to="/profile" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                ตั้งค่าบัญชี
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ออกจากระบบ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}