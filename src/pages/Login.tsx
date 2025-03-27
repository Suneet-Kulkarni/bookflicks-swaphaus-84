
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { BookOpenText, ArrowLeft, MailIcon, KeyIcon } from "lucide-react";
import { authService } from "@/utils/authService";
import { toast } from "sonner";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      await authService.login(data);
      toast("Logged in successfully!");
      navigate("/welcome");
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message);
      } else {
        toast("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden page-transition">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-bookswap-teal/5 via-transparent to-bookswap-amber/5 pointer-events-none"></div>
      <div className="absolute top-20 right-20 w-40 h-40 bg-bookswap-coral/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-20 w-60 h-60 bg-bookswap-teal/10 rounded-full blur-3xl"></div>
      
      <div className="glass w-full max-w-md p-8 rounded-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <BookOpenText className="h-8 w-8 text-bookswap-teal" />
            <span className="font-serif text-2xl font-bold text-bookswap-navy">
              Book<span className="text-bookswap-coral">Swap</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-center text-bookswap-navy">Welcome Back</h1>
          <p className="text-bookswap-navy/70 mt-2 text-center">
            Sign in to continue your book swapping journey
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="label">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bookswap-navy/50" />
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="input-field pl-10"
                        {...field}
                      />
                    </div>
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
                  <FormLabel className="label">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bookswap-navy/50" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="input-field pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full button-primary py-6"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center mt-6">
              <p className="text-bookswap-navy/70">
                Don't have an account?{" "}
                <Link to="/signup" className="text-bookswap-teal font-medium hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </Form>

        <div className="mt-8">
          <Link
            to="/"
            className="flex items-center justify-center text-bookswap-navy/70 hover:text-bookswap-teal transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
