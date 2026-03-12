import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from "@/utils/validations";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, isLoading } = useAuth();
  const { toast } = useToast();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/dashboard";
  // TODO(BACKEND): If you add email verification, MFA, or onboarding checks,
  // update this redirect logic to route users to the correct next step.

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password });
      // TODO(BACKEND): If backend returns "email_not_verified" or similar,
      // handle that response before navigating to protected pages.
      navigate(from, { replace: true });
    } catch (err: any) {
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      await signup({ name: data.name, email: data.email, password: data.password });
      // TODO(BACKEND): If signup should not auto-login, navigate to
      // a "check your email" page instead of protected routes.
      navigate(from, { replace: true });
    } catch (err: any) {
      toast({ title: "Signup failed", description: err.message, variant: "destructive" });
    }
  };

  const loginErrors = loginForm.formState.errors;
  const signupErrors = signupForm.formState.errors;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel */}
      <div className="hidden lg:flex gradient-hero items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full gradient-primary opacity-[0.06] blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full bg-accent opacity-20 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md relative"
        >
          <Link to="/" className="font-heading font-bold text-2xl text-foreground tracking-tight">SmartClosetAI</Link>
          <h2 className="font-heading text-4xl font-bold text-foreground mt-10 leading-[1.15] tracking-tight">
            Your wardrobe,{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>reimagined.</span>
          </h2>
          <p className="text-muted-foreground mt-5 text-lg leading-relaxed">
            Organize, style, and discover new outfit combinations powered by AI.
          </p>
          <div className="flex items-center gap-3 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-subtle">
              <Sparkles className="h-3 w-3 text-primary" /> AI-powered
            </div>
            <span>·</span>
            <span>Free to start</span>
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex items-center justify-center p-6 bg-card">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]"
        >
          <Link to="/" className="font-heading font-bold text-2xl text-foreground lg:hidden block mb-10 tracking-tight">SmartClosetAI</Link>

          <div className="space-y-8">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                {isLogin ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                {isLogin ? "Sign in to access your wardrobe" : "Get started with SmartClosetAI for free"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl bg-secondary p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isLogin ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${!isLogin ? "bg-card shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Create Account
              </button>
            </div>

            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className="h-11 rounded-xl" {...loginForm.register("email")} />
                  {loginErrors.email && <p className="text-xs text-destructive mt-1">{loginErrors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" className="h-11 rounded-xl" {...loginForm.register("password")} />
                  {loginErrors.password && <p className="text-xs text-destructive mt-1">{loginErrors.password.message}</p>}
                </div>
                <div className="text-right">
                  <button type="button" className="text-sm text-primary hover:underline underline-offset-2 font-medium">Forgot password?</button>
                </div>
                <Button type="submit" variant="hero" className="w-full h-11 text-[15px]" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
                  <Input id="name" placeholder="Your name" className="h-11 rounded-xl" {...signupForm.register("name")} />
                  {signupErrors.name && <p className="text-xs text-destructive mt-1">{signupErrors.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" className="h-11 rounded-xl" {...signupForm.register("email")} />
                  {signupErrors.email && <p className="text-xs text-destructive mt-1">{signupErrors.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">Password</Label>
                  <Input id="signup-password" type="password" placeholder="••••••••" className="h-11 rounded-xl" {...signupForm.register("password")} />
                  {signupErrors.password && <p className="text-xs text-destructive mt-1">{signupErrors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm" className="text-sm font-medium text-foreground">Confirm Password</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" className="h-11 rounded-xl" {...signupForm.register("confirmPassword")} />
                  {signupErrors.confirmPassword && <p className="text-xs text-destructive mt-1">{signupErrors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" variant="hero" className="w-full h-11 text-[15px]" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-wider">or</span></div>
            </div>

            <Button variant="outline" className="w-full h-11 rounded-xl text-sm font-medium">
              <svg className="h-4 w-4 mr-2.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
