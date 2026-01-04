import { use, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, User, Lock, Mail, Phone, Building } from "lucide-react";

import { userQueryOptions, api, useChangePassword, useUpdateProfile } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export const Route = createFileRoute("/_admin/profile")({
  component: ProfilePage,
});

// Profile update schema
const profileSchema = z.object({
  fullName: z.string().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  phone: z.string().optional(),
  department: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Change password schema
const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "รหัสผ่านปัจจุบันต้องมีอย่างน้อย 6 ตัวอักษร"),
  newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: z.string().min(6, "ยืนยันรหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"],
});




type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: userData, isLoading } = useQuery(userQueryOptions);
  const user = userData?.data;

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      department: user?.department || "",
    },
  });

  // Password form
  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update profile form when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        department: user.department || "",
      });
    }
  }, [user, profileForm]);

  // Update profile mutation
  const updateProfileMutation = useUpdateProfile();

  // Change password mutation form api.ts
  const changePasswordMutation = useChangePassword(); 

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data, {
      onSuccess: () => {
        toast.success("อัพเดทโปรไฟล์สำเร็จ");
        queryClient.invalidateQueries({ queryKey: ["get-current-user"] });
      },
      onError: (error: Error) => {
        toast.error(error.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const onPasswordSubmit = (data: ChangePasswordFormValues) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
        passwordForm.reset();
      },
      onError: (error: Error) => {
        toast.error(error.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout.$post();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      queryClient.removeQueries({ queryKey: ["get-current-user"] });
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>ไม่พบข้อมูลผู้ใช้</p>
      </div>
    );
  }

  const currentUser = {
    fullName: user.fullName || user.email,
    email: user.email,
    role: user.role,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={currentUser} onLogout={handleLogout} />
      <SidebarInset className="bg-slate-50">
        <AppHeader />

        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">โปรไฟล์</h2>
              <p className="text-muted-foreground">
                จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชี
              </p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" />
                ข้อมูลส่วนตัว
              </TabsTrigger>
              <TabsTrigger value="password">
                <Lock className="mr-2 h-4 w-4" />
                เปลี่ยนรหัสผ่าน
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4">
              <Card className="pt-4 py-4 md:py-5 md:pt-5">
                <CardHeader>
                  <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                  <CardDescription>
                    อัพเดทข้อมูลโปรไฟล์ของคุณ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ชื่อ-นามสกุล</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="ชื่อ-นามสกุล"
                                    className="pl-9"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>อีเมล</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="email@example.com"
                                    className="pl-9"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>เบอร์โทรศัพท์</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="0812345678"
                                    className="pl-9"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>แผนก</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    placeholder="แผนก"
                                    className="pl-9"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              กำลังบันทึก...
                            </>
                          ) : (
                            "บันทึกการเปลี่ยนแปลง"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Password Tab */}
            <TabsContent value="password" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>เปลี่ยนรหัสผ่าน</CardTitle>
                  <CardDescription>
                    เปลี่ยนรหัสผ่านเพื่อรักษาความปลอดภัยของบัญชี
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                      className="space-y-6"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>รหัสผ่านปัจจุบัน</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="รหัสผ่านปัจจุบัน"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>รหัสผ่านใหม่</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="รหัสผ่านใหม่"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ยืนยันรหัสผ่านใหม่</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="ยืนยันรหัสผ่านใหม่"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator />

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={changePasswordMutation.isPending}
                        >
                          {changePasswordMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              กำลังเปลี่ยน...
                            </>
                          ) : (
                            "เปลี่ยนรหัสผ่าน"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
