import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Filter, Search, User, FileText, Activity } from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Components
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

import { api, userQueryOptions } from "@/lib/api";

export const Route = createFileRoute('/_admin/logs')({
  component: LogPage,
});

// Types
interface GuestRegistrationLog {
  id: string;
  guestName: string;
  regNumber: string;
  ipAddress: string | null;
  userAgent: string | null;
  action: string;
  details: string | null;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export function LogPage() {
  const { data: userData } = useQuery(userQueryOptions);
  const user = userData?.data;

  // Guest Registration Logs State
  const [guestSearchTerm, setGuestSearchTerm] = useState("");
  const [guestActionFilter, setGuestActionFilter] = useState<string>("all");
  const [guestDateFrom, setGuestDateFrom] = useState("");
  const [guestDateTo, setGuestDateTo] = useState("");
  const [guestPage, setGuestPage] = useState(1);

  // Activity Logs State
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [activityActionFilter, setActivityActionFilter] = useState<string>("all");
  const [activityDateFrom, setActivityDateFrom] = useState("");
  const [activityDateTo, setActivityDateTo] = useState("");
  const [activityPage, setActivityPage] = useState(1);

  // Fetch Guest Registration Logs
  const { data: guestLogsData, isLoading: isLoadingGuestLogs } = useQuery({
    queryKey: ["guest-registration-logs", guestPage, guestActionFilter, guestDateFrom, guestDateTo],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: guestPage.toString(),
        limit: "20",
      };
      if (guestActionFilter !== "all") params.action = guestActionFilter;
      if (guestDateFrom) params.startDate = guestDateFrom;
      if (guestDateTo) params.endDate = guestDateTo;

      const res = await api.logs["guest-registrations"].$get({ query: params as any });
      if (!res.ok) throw new Error("Failed to fetch guest logs");
      return res.json();
    },
  });

  // Fetch Activity Logs
  const { data: activityLogsData, isLoading: isLoadingActivityLogs } = useQuery({
    queryKey: ["activity-logs", activityPage, activityActionFilter, activityDateFrom, activityDateTo],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: activityPage.toString(),
        limit: "20",
      };
      if (activityActionFilter !== "all") params.action = activityActionFilter;
      if (activityDateFrom) params.startDate = activityDateFrom;
      if (activityDateTo) params.endDate = activityDateTo;

      const res = await api.logs.$get({ query: params as any });
      if (!res.ok) throw new Error("Failed to fetch activity logs");
      return res.json();
    },
  });

  const guestLogs = (guestLogsData?.data?.logs as GuestRegistrationLog[]) || [];
  const activityLogs = (activityLogsData?.data?.logs as ActivityLog[]) || [];

  // Filter guest logs by search term (client-side)
  const filteredGuestLogs = guestLogs.filter((log) => {
    const searchLower = guestSearchTerm.toLowerCase();
    return (
      log.guestName.toLowerCase().includes(searchLower) ||
      log.regNumber.toLowerCase().includes(searchLower) ||
      (log.ipAddress?.toLowerCase() || "").includes(searchLower)
    );
  });

  // Filter activity logs by search term (client-side)
  const filteredActivityLogs = activityLogs.filter((log) => {
    const searchLower = activitySearchTerm.toLowerCase();
    return (
      log.userName.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      (log.ipAddress?.toLowerCase() || "").includes(searchLower)
    );
  });

  const handleLogout = async () => {
    // Implement logout logic
  };

  const currentUser = user
    ? {
        fullName: user.fullName || user.email,
        email: user.email,
        role: user.role,
      }
    : {
        fullName: "Guest",
        email: "",
        role: "admin",
      };

  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} onLogout={handleLogout} />
      <SidebarInset className="bg-slate-50">
        <AppHeader />

        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-800">Activity Logs</h2>
              <p className="text-slate-500 mt-1">ประวัติการใช้งานระบบทั้งหมด</p>
            </div>
          </div>

          <Tabs defaultValue="guest-logs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="guest-logs" className="gap-2">
                <FileText className="w-4 h-4" />
                Guest Registration Logs
              </TabsTrigger>
              <TabsTrigger value="activity-logs" className="gap-2">
                <Activity className="w-4 h-4" />
                Activity Logs
              </TabsTrigger>
            </TabsList>

            {/* Guest Registration Logs Tab */}
            <TabsContent value="guest-logs" className="space-y-4">
              <Card>
                <CardHeader className="border-b bg-white pt-5">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Guest Registration Logs
                  </CardTitle>
                  <p className="text-sm text-slate-500">บันทึกการลงทะเบียนและกิจกรรมของแขก</p>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Filters */}
                  <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="guest-search" className="text-sm font-medium mb-1.5 block">
                          Search
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="guest-search"
                            type="text"
                            placeholder="Name, Reg No, IP..."
                            value={guestSearchTerm}
                            onChange={(e) => setGuestSearchTerm(e.target.value)}
                            className="pl-9 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="guest-action" className="text-sm font-medium mb-1.5 block">
                          Action
                        </Label>
                        <Select value={guestActionFilter} onValueChange={setGuestActionFilter}>
                          <SelectTrigger id="guest-action" className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="REGISTRATION">Registration</SelectItem>
                            <SelectItem value="CHECK_IN">Check In</SelectItem>
                            <SelectItem value="CHECK_OUT">Check Out</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="guest-date-from" className="text-sm font-medium mb-1.5 block">
                          From Date
                        </Label>
                        <Input
                          id="guest-date-from"
                          type="date"
                          value={guestDateFrom}
                          onChange={(e) => setGuestDateFrom(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="guest-date-to" className="text-sm font-medium mb-1.5 block">
                          To Date
                        </Label>
                        <Input
                          id="guest-date-to"
                          type="date"
                          value={guestDateTo}
                          onChange={(e) => setGuestDateTo(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead>Guest Name</TableHead>
                          <TableHead>Reg No.</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingGuestLogs ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : filteredGuestLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                              No logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredGuestLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">{log.guestName}</TableCell>
                              <TableCell>
                                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                                  {log.regNumber}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    log.action === "REGISTRATION"
                                      ? "bg-blue-50 text-blue-700"
                                      : log.action === "CHECK_IN"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-orange-50 text-orange-700"
                                  }`}
                                >
                                  {log.action}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">
                                {log.ipAddress || "-"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString("th-TH")}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                {log.details || "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Logs Tab */}
            <TabsContent value="activity-logs" className="space-y-4">
              <Card>
                <CardHeader className="border-b bg-white pt-5">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Activity Logs
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    บันทึกการทำงานของผู้ใช้และผู้ดูแลระบบทั้งหมด
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Filters */}
                  <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="activity-search" className="text-sm font-medium mb-1.5 block">
                          Search
                        </Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="activity-search"
                            type="text"
                            placeholder="User, Action, IP..."
                            value={activitySearchTerm}
                            onChange={(e) => setActivitySearchTerm(e.target.value)}
                            className="pl-9 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="activity-action" className="text-sm font-medium mb-1.5 block">
                          Action
                        </Label>
                        <Select value={activityActionFilter} onValueChange={setActivityActionFilter}>
                          <SelectTrigger id="activity-action" className="bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Actions</SelectItem>
                            <SelectItem value="LOGIN">Login</SelectItem>
                            <SelectItem value="LOGOUT">Logout</SelectItem>
                            <SelectItem value="CREATE">Create</SelectItem>
                            <SelectItem value="UPDATE">Update</SelectItem>
                            <SelectItem value="DELETE">Delete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="activity-date-from" className="text-sm font-medium mb-1.5 block">
                          From Date
                        </Label>
                        <Input
                          id="activity-date-from"
                          type="date"
                          value={activityDateFrom}
                          onChange={(e) => setActivityDateFrom(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="activity-date-to" className="text-sm font-medium mb-1.5 block">
                          To Date
                        </Label>
                        <Input
                          id="activity-date-to"
                          type="date"
                          value={activityDateTo}
                          onChange={(e) => setActivityDateTo(e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingActivityLogs ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : filteredActivityLogs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                              No logs found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredActivityLogs.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                {log.userName}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    log.action.includes("LOGIN")
                                      ? "bg-green-50 text-green-700"
                                      : log.action.includes("LOGOUT")
                                      ? "bg-gray-50 text-gray-700"
                                      : log.action.includes("CREATE")
                                      ? "bg-blue-50 text-blue-700"
                                      : log.action.includes("UPDATE")
                                      ? "bg-yellow-50 text-yellow-700"
                                      : log.action.includes("DELETE")
                                      ? "bg-red-50 text-red-700"
                                      : "bg-slate-50 text-slate-700"
                                  }`}
                                >
                                  {log.action}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">
                                {log.ipAddress || "-"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {new Date(log.createdAt).toLocaleString("th-TH")}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                {log.details || "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
