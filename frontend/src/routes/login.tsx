import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api, userQueryOptions } from "@/lib/api";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email({ message: "กรุณากรอกอีเมลให้ถูกต้อง" }),
  password: z
    .string()
    .min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if user is already logged in
  const { data: user, isLoading } = useQuery(userQueryOptions);

  // Login mutation using Hono RPC client

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const res = await api.auth.login.$post({
        json: {
          email: values.email,
          password: values.password,
        },
      });

      const data = await res.json();
      // console.log("Login response data:", data);
      if (!res.ok || !data.success) {
        throw new Error(data.message || "เข้าสู่ระบบไม่สำเร็จ");
      }

      return data;
    },
    onSuccess: async (data) => {
      // console.log("Login successful:", data);

      // Store tokens in localStorage
      if (data.data) {
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }

      // Clear and refetch user query
      queryClient.removeQueries({ queryKey: ["get-current-user"] });

      // Wait for user data to be ready
      await queryClient.prefetchQuery(userQueryOptions);

      toast.success(data.message || "เข้าสู่ระบบสำเร็จ");

      // Navigate to dashboard after everything is ready
      navigate({ to: "/admin" });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast.error(error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    },
  });

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  // Redirect if already logged in
  if (user?.success && user?.data) {
    navigate({ to: "/admin" });
    return null;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-md p-4">
        <CardHeader>
          <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
          <CardDescription>
            กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="email">อีเมล</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          placeholder="johndoe@mail.com"
                          type="email"
                          autoComplete="email"
                          disabled={loginMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <FormLabel htmlFor="password">รหัสผ่าน</FormLabel>
                        {/* <a
                          href="/forgot-password"
                          className="ml-auto inline-block text-sm underline"
                        >
                          ลืมรหัสผ่าน?
                        </a> */}
                      </div>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="******"
                          autoComplete="current-password"
                          disabled={loginMutation.isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}