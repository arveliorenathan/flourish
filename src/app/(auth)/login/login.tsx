"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginInput, loginSchema } from "@/lib/schema/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { getSession, signIn } from "next-auth/react";

export function Login() {
  const router = useRouter();
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    const signInData = await signIn(`credentials`, {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (signInData?.error) {
      toast.error("Login Failed", {
        description: "Please fill in your data correctly.",
        duration: 3000,
      });
    } else {
      const session = await getSession();

      toast.success("Login Success", {
        description: `Welcome back ${session?.user.username}`,
        duration: 3000,
      });
      if (session?.user?.role === "ADMIN") {
        router.refresh();
        router.push("/admin/dashboard");
      } else {
        router.refresh();
        router.push("/user/dashboard");
      }
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold">Login</CardTitle>
        <CardDescription>Welcome to Flourish platform</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@gmail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
