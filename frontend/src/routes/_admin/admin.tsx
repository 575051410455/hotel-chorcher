import React, { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // เพิ่ม import
import {
  Edit, Trash2, FileText, Eye, FileDown,Search, Plane, Loader2
} from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import type { Guest, GuestQuery, UpdateGuestInput } from "@backend/types";

// UI Imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"; // เพิ่ม SidebarInset
import { Switch } from "@/components/ui/switch";

// Components
import { EditModal } from "@/components/Editmodal";
import { DeleteDialog } from "@/components/DeleteDialog";
import { PreviewModal } from "@/components/PreviewModal";
import { AppSidebar } from "@/components/app-sidebar"; // New Component
import { AppHeader } from "@/components/app-header";   // New Component
import { useGuests, useUpdateGuest, useDeleteGuest, userQueryOptions, api } from "@/lib/api";




export const Route = createFileRoute('/_admin/admin')({
  component: AdminDashboard,
});

export function AdminDashboard() {
  const navigate = useNavigate();
  
  // ✅ ใช้ useQueryClient แทน Route.useRouteContext()
  const queryClient = useQueryClient();

  // 🔑 ดึงข้อมูล user ที่ login อยู่ จาก React Query
  const { data: userData } = useQuery(userQueryOptions);
  const user = userData?.data;

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<GuestQuery["status"]>("all");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [deletingGuest, setDeletingGuest] = useState<Guest | null>(null);
  const [previewGuest, setPreviewGuest] = useState<Guest | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingRoomNumber, setEditingRoomNumber] = useState<{ [key: number]: string }>({});

  // Debounce search term (รอ 500ms หลังจากพิมพ์เสร็จ)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Queries & Mutations
  const { data: guestsData, isLoading } = useGuests({ search: debouncedSearchTerm, status: filterStatus, limit: 100, page: 1 });
  const updateGuest = useUpdateGuest();
  const deleteGuest = useDeleteGuest();

  const guests = guestsData?.data || [];

  // console.log("Guests Data:", guests);  

  // Handlers
  const handleLogout = async () => {
    try {
      // เรียก API logout
      await api.auth.logout.$post();
      
      // Clear localStorage tokens
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      
      // Clear user query cache
      queryClient.removeQueries({ queryKey: ["get-current-user"] });
    } catch (e) {
      console.error("Logout failed:", e);
    }
    navigate({ to: "/login" });
  };

  const handleEdit = (guest: Guest) => setEditingGuest(guest);
  const handleDelete = (guest: Guest) => setDeletingGuest(guest);
  const handlePreview = (guest: Guest) => {
    setPreviewGuest(guest);
    setShowPreview(true);
  };

  const handleSaveEdit = async (data: UpdateGuestInput) => {
    if (!editingGuest) return;
    try {
      await updateGuest.mutateAsync({ id: editingGuest.id, data });
      setEditingGuest(null);
    } catch (error) {
      console.error("Failed to update guest:", error);
      toast.error("Failed to update guest");
    }
  };

  const confirmDelete = async () => {
    if (!deletingGuest) return;
    try {
      await deleteGuest.mutateAsync(deletingGuest.id);
      setDeletingGuest(null);
    } catch (error) {
      console.error("Failed to delete guest:", error);
      toast.error("Failed to delete guest");
    }
  };

  const handleCheckInToggle = async (guest: Guest) => {
    try {
      await updateGuest.mutateAsync({
        id: guest.id,
        data: { checkedIn: !guest.checkedIn }
      });
    } catch (error) {
      console.error("Failed to update check-in status:", error);
      toast.error("Failed to update check-in status");
    }
  };

const handleRoomNumberChange = (guestId: number, value: string) => {
  setEditingRoomNumber((prev) => ({ ...prev, [guestId]: value }));
};

const handleRoomNumberBlur =
  (guest: Guest) => async (e: React.FocusEvent<HTMLInputElement>) => {
    const next = e.currentTarget.value.trim();
    const prevValue = (guest.roomNumber ?? "").trim();

    if (next === prevValue) {
      setEditingRoomNumber((prev) => {
        const { [guest.id]: _, ...rest } = prev;
        return rest;
      });
      return;
    }

    try {
      await updateGuest.mutateAsync({
        id: guest.id,
        data: { roomNumber: next === "" ? null : next },
      });

      setEditingRoomNumber((prev) => {
        const { [guest.id]: _, ...rest } = prev;
        return rest;
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update room number");
    }
  };


  const handleExportExcel = () => {
    if (guests.length === 0) {
      toast.error("No guests to export");
      return;
    }
    const excelData = guests.map((guest) => ({
      "Reg No.": guest.regNumber,
      "First Name": guest.firstName,
      "Last Name": guest.lastName,
      "Flight Number": guest.flightNumber || "-",
      "Room Number": guest.roomNumber || "-",
      "Checked In": guest.checkedIn ? "Yes" : "No",
      "Registration Date": new Date(guest.createdAt).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Guest Registrations");
    XLSX.writeFile(wb, `Hotel_Guests_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  // 🔑 เตรียมข้อมูล User สำหรับ Sidebar
  const currentUser = user ? {
    fullName: user.fullName || user.email,
    email: user.email,
    role: user.role
  } : {
    fullName: "Guest",
    email: "",
    role: "admin"
  };

  return (
    <SidebarProvider>
      {/* 1. Sidebar */}
      <AppSidebar user={currentUser} onLogout={handleLogout} />
      
      {/* 2. Main Content Area */}
      <SidebarInset className="bg-slate-50">
        
        {/* 3. Header */}
        <AppHeader />

        {/* 4. Dashboard Content (เนื้อหาเดิมของคุณ) */}
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="border-b bg-white rounded-t-xl px-6 py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-800">Guest Management</CardTitle>
                  <p className="text-slate-500 text-sm">Manage hotel guest registrations</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {guests.length > 0 && (
                    <>
                      <Button variant="outline" className="bg-purple-600 text-white hover:bg-purple-700 border-purple-600">
                        <Plane className="w-4 h-4 mr-2" />
                        Immigration
                      </Button>
                      <Button variant="outline" onClick={handleExportExcel} className="bg-green-600 text-white hover:bg-green-700 border-green-600">
                          <FileDown className="w-4 h-4 mr-2" />
                          Excel
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 bg-white">
              {guests.length === 0 && !searchTerm && filterStatus === "all" ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No guests registered yet</h3>
                  <p className="text-sm text-gray-500">Guest registrations will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <Label htmlFor="search" className="text-sm font-medium mb-1.5 block">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input id="search" type="text" placeholder="Name or flight number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 bg-white" />
                      </div>
                    </div>
                    <div className="min-w-[180px]">
                      <Label htmlFor="filter" className="text-sm font-medium mb-1.5 block">Status</Label>
                      <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as GuestQuery["status"])}>
                        <SelectTrigger id="filter" className="bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Guests</SelectItem>
                          <SelectItem value="checkedIn">Checked In</SelectItem>
                          <SelectItem value="notCheckedIn">Not Checked In</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                          <TableHead className="w-[80px]">No.</TableHead>
                          <TableHead className="w-[80px]">Img</TableHead>
                          <TableHead>Guest Name</TableHead>
                          <TableHead>Flight</TableHead>
                          <TableHead>Guest 2 Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Check In/Out</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {guests.map((guest) => (
                          <TableRow key={guest.id}>
                            <TableCell><span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">{guest.regNumber}</span></TableCell>
                            <TableCell>
                              {guest.image ? (
                                <img src={guest.image} className="w-10 h-10 object-cover rounded border" />
                              ) : (
                                <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center"><FileText className="w-4 h-4 text-slate-300" /></div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium">{guest.firstName} {guest.lastName}</TableCell>
                            <TableCell>{guest.flightNumber || "-"}</TableCell>
                            <TableCell className="font-medium">{guest.guest2FirstName} {guest.guest2LastName}</TableCell>

                            <TableCell>
                              {guest.checkedIn ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">Checked In</span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Pending</span>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={guest.checkedIn}
                                  onCheckedChange={() => handleCheckInToggle(guest)}
                                  disabled={updateGuest.isPending}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {guest.checkedIn ? "Check Out" : "Check In"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editingRoomNumber[guest.id] ?? guest.roomNumber ?? ""}
                                onChange={(e) => handleRoomNumberChange(guest.id, e.target.value)}
                                onBlur={handleRoomNumberBlur(guest)}
                                placeholder="Room No."
                                className="w-24 text-sm"
                              />
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{new Date(guest.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePreview(guest)}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(guest)}><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-600" onClick={() => handleDelete(guest)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>

      {/* Modals placed outside main content flow but inside provider is fine */}
      <PreviewModal 
        guest={previewGuest} 
        isOpen={showPreview} 
        onClose={() => { setShowPreview(false); setPreviewGuest(null); }} 
      />
      {editingGuest &&
        <EditModal
          guest={editingGuest}
          onClose={() => setEditingGuest(null)}
          onSave={handleSaveEdit}
          isSaving={updateGuest.isPending}
          userRole={user?.role}
        />}
      {deletingGuest && 
        <DeleteDialog 
          isOpen={!!deletingGuest} 
          onClose={() => setDeletingGuest(null)} 
          onConfirm={confirmDelete} 
          guestName={`${deletingGuest.firstName} ${deletingGuest.lastName}`} 
          isDeleting={deleteGuest.isPending} 
        />
      }
    </SidebarProvider>
  );
}