import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const { loginMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true })),
  });

  const onSubmit = form.handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} className="bubble-input" />
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
                    <Input type="password" {...field} className="bubble-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bubble-button w-full">
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function RegisterForm() {
  const { registerMutation } = useAuth();
  const form = useForm({
    resolver: zodResolver(insertUserSchema),
  });

  const onSubmit = form.handleSubmit((data) => {
    registerMutation.mutate(data);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} className="bubble-input" />
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
                    <Input type="password" {...field} className="bubble-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="bubble-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bubble-button w-full">
              Register
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
