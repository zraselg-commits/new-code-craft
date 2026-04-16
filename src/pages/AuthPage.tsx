"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LogIn, Eye, EyeOff, Loader2, UserPlus, Sparkles,
  Phone, Mail,
} from "lucide-react";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { CountryCodePicker } from "@/components/ui/PhoneInput";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { firebaseEnabled, signInWithGoogle } from "@/lib/firebase";

const emailLoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const phoneLoginSchema = z.object({
  dialCode: z.string().default("+880"),
  phoneNumber: z.string().min(5, "Enter a valid phone number"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  dialCode: z.string().default("+880"),
  phoneNumber: z.string().max(20).optional(),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

const phoneSignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  confirmPassword: z.string().min(1, "Please confirm your password"),
});

type EmailLoginData = z.infer<typeof emailLoginSchema>;
type PhoneLoginData = z.infer<typeof phoneLoginSchema>;
type SignupData = z.infer<typeof signupSchema>;
type PhoneSignupData = z.infer<typeof phoneSignupSchema>;

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loginWithToken, signup } = useAuth();
  const from = searchParams.get("from") || "/";

  useEffect(() => {
    if (user) router.replace(from);
  }, [user, from, router]);

  const [authTab, setAuthTab] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [serverError, setServerError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [isNewUser, setIsNewUser] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");

  const [isPhoneNewUser, setIsPhoneNewUser] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingPhonePassword, setPendingPhonePassword] = useState("");

  const emailForm = useForm<EmailLoginData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<PhoneLoginData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: { dialCode: "+880", phoneNumber: "", password: "" },
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", dialCode: "+880", phoneNumber: "", confirmPassword: "" },
  });

  const phoneSignupForm = useForm<PhoneSignupData>({
    resolver: zodResolver(phoneSignupSchema),
    defaultValues: { name: "", confirmPassword: "" },
  });

  if (user) return null;

  const onEmailSubmit = async (data: EmailLoginData) => {
    setServerError("");
    try {
      const r = await fetch("/api/auth/smart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await r.json();
      if (!r.ok) {
        setServerError(json.error || "Something went wrong");
        return;
      }
      if (json.status === "new_user") {
        setPendingEmail(data.email);
        setPendingPassword(data.password);
        setIsNewUser(true);
        return;
      }
      if (json.status === "logged_in") {
        loginWithToken(json.token, json.user);
        router.replace(from);
      }
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const onPhoneSubmit = async (data: PhoneLoginData) => {
    setServerError("");
    const dialCode = data.dialCode.replace("-CA", "");
    const fullPhone = `${dialCode}${data.phoneNumber.trim()}`;
    try {
      const r = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone, password: data.password }),
      });
      const json = await r.json();
      if (!r.ok) {
        setServerError(json.error || "Something went wrong");
        return;
      }
      if (json.status === "new_user") {
        setPendingPhone(fullPhone);
        setPendingPhonePassword(data.password);
        setIsPhoneNewUser(true);
        return;
      }
      if (json.status === "logged_in") {
        loginWithToken(json.token, json.user);
        router.replace(from);
      }
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const onEmailSignupSubmit = async (data: SignupData) => {
    if (data.confirmPassword !== pendingPassword) {
      signupForm.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    const dialCode = data.dialCode.replace("-CA", "");
    const phone =
      data.phoneNumber?.trim()
        ? `${dialCode}${data.phoneNumber.trim()}`
        : undefined;
    try {
      await signup(data.name, pendingEmail, pendingPassword, phone);
      setIsNewUser(false);
      router.replace(from);
    } catch (err) {
      signupForm.setError("root", {
        message: err instanceof Error ? err.message : "Registration failed",
      });
    }
  };

  const onPhoneSignupSubmit = async (data: PhoneSignupData) => {
    if (data.confirmPassword !== pendingPhonePassword) {
      phoneSignupForm.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    try {
      const r = await fetch("/api/auth/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", phone: pendingPhone, name: data.name, password: pendingPhonePassword }),
      });
      const json = await r.json();
      if (!r.ok) {
        phoneSignupForm.setError("root", { message: json.error || "Registration failed" });
        return;
      }
      loginWithToken(json.token, json.user);
      setIsPhoneNewUser(false);
      router.replace(from);
    } catch {
      phoneSignupForm.setError("root", { message: "Network error. Please try again." });
    }
  };

  const handleGoogle = async () => {
    setGoogleError("");
    setIsGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      const r = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, createAccount: true }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || "Google sign-in failed");
      loginWithToken(json.token, json.user);
      router.replace(from);
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-24 pb-20 relative min-h-screen flex items-center">
        <div className="absolute inset-0 mesh-gradient opacity-30" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-[420px] w-full">
          <div className="glass-card p-8 animate-fade-in-up">

            <div className="text-center mb-7">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <Sparkles size={22} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Sign in or create your account to continue
              </p>
            </div>

            {/* Tab toggle */}
            <div className="flex rounded-lg border border-border/50 p-1 mb-6 gap-1" data-testid="tab-switcher">
              <button
                type="button"
                onClick={() => { setAuthTab("email"); setServerError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  authTab === "email"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-email"
              >
                <Mail size={14} /> Email
              </button>
              <button
                type="button"
                onClick={() => { setAuthTab("phone"); setServerError(""); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  authTab === "phone"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid="tab-phone"
              >
                <Phone size={14} /> Phone
              </button>
            </div>

            {serverError && (
              <div
                className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg mb-4"
                data-testid="error-server"
              >
                {serverError}
              </div>
            )}

            {authTab === "email" ? (
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@email.com"
                            autoComplete="email"
                            data-testid="input-email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="current-password"
                              data-testid="input-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full btn-primary-glow mt-1"
                    disabled={emailForm.formState.isSubmitting}
                    data-testid="button-continue"
                  >
                    {emailForm.formState.isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin mr-2" /> Checking…</>
                    ) : (
                      <><LogIn size={16} className="mr-2" /> Continue</>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Phone size={13} className="text-muted-foreground" /> Phone number
                    </FormLabel>
                    <div className="flex">
                      <FormField
                        control={phoneForm.control}
                        name="dialCode"
                        render={({ field }) => (
                          <CountryCodePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <FormField
                        control={phoneForm.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="1XXXXXXXXX"
                              autoComplete="tel-national"
                              className="rounded-l-none flex-1 min-w-0"
                              data-testid="input-phone-number"
                              {...field}
                            />
                          </FormControl>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                  <FormField
                    control={phoneForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="current-password"
                              data-testid="input-phone-password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full btn-primary-glow mt-1"
                    disabled={phoneForm.formState.isSubmitting}
                    data-testid="button-continue-phone"
                  >
                    {phoneForm.formState.isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin mr-2" /> Checking…</>
                    ) : (
                      <><LogIn size={16} className="mr-2" /> Continue</>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Google sign-in */}
            {firebaseEnabled && (
              <>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs text-muted-foreground">
                    <span className="bg-card px-3">or continue with</span>
                  </div>
                </div>
                {googleError && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-xs px-3 py-2 rounded-lg mb-3">
                    {googleError}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center gap-2.5 border-border/60 hover:bg-muted/50"
                  onClick={handleGoogle}
                  disabled={isGoogleLoading}
                  data-testid="button-google"
                >
                  {isGoogleLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continue with Google
                </Button>
              </>
            )}

            <p className="text-center text-xs text-muted-foreground mt-5">
              New here? Just enter your {authTab === "email" ? "email" : "phone"} &amp; password above — we'll guide you through account creation.
            </p>
          </div>
        </div>
      </section>

      {/* Email signup dialog */}
      <Dialog
        open={isNewUser}
        onOpenChange={(open) => {
          if (!open) { setIsNewUser(false); signupForm.reset(); }
        }}
      >
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden" data-testid="dialog-create-account">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <UserPlus size={18} className="text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">Create your account</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                No account found for{" "}
                <span className="font-medium text-foreground break-all">{pendingEmail}</span>.
                Fill in a few details to get started.
              </DialogDescription>
            </DialogHeader>

            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onEmailSignupSubmit)} className="space-y-4">
                {signupForm.formState.errors.root && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
                    {signupForm.formState.errors.root.message}
                  </div>
                )}
                <FormField
                  control={signupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" autoComplete="name" data-testid="input-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Phone size={13} className="text-muted-foreground" />
                    Phone
                    <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                  </FormLabel>
                  <div className="flex">
                    <FormField
                      control={signupForm.control}
                      name="dialCode"
                      render={({ field }) => (
                        <CountryCodePicker value={field.value} onChange={field.onChange} />
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="1XXXXXXXXX"
                            autoComplete="tel-national"
                            className="rounded-l-none flex-1 min-w-0"
                            data-testid="input-phone-number"
                            {...field}
                          />
                        </FormControl>
                      )}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
                <FormField
                  control={signupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPw ? "text" : "password"}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            data-testid="input-confirm-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            data-testid="button-toggle-confirm-password"
                          >
                            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2 pt-1">
                  <Button type="submit" className="w-full btn-primary-glow" disabled={signupForm.formState.isSubmitting} data-testid="button-create-account">
                    {signupForm.formState.isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin mr-2" /> Creating account…</>
                    ) : (
                      <><UserPlus size={16} className="mr-2" /> Create Account</>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setIsNewUser(false); signupForm.reset(); }}
                    className="text-sm text-muted-foreground hover:text-foreground text-center transition-colors py-1"
                    data-testid="button-back"
                  >
                    ← Use a different email
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Phone signup dialog */}
      <Dialog
        open={isPhoneNewUser}
        onOpenChange={(open) => {
          if (!open) { setIsPhoneNewUser(false); phoneSignupForm.reset(); }
        }}
      >
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden" data-testid="dialog-create-phone-account">
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <UserPlus size={18} className="text-primary" />
              </div>
              <DialogTitle className="text-xl font-bold">Create your account</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                No account found for{" "}
                <span className="font-medium text-foreground">{pendingPhone}</span>.
                Just add your name to get started.
              </DialogDescription>
            </DialogHeader>

            <Form {...phoneSignupForm}>
              <form onSubmit={phoneSignupForm.handleSubmit(onPhoneSignupSubmit)} className="space-y-4">
                {phoneSignupForm.formState.errors.root && (
                  <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3 rounded-lg">
                    {phoneSignupForm.formState.errors.root.message}
                  </div>
                )}
                <FormField
                  control={phoneSignupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" autoComplete="name" data-testid="input-phone-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={phoneSignupForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPw ? "text" : "password"}
                            placeholder="Re-enter your password"
                            autoComplete="new-password"
                            data-testid="input-phone-confirm-password"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-2 pt-1">
                  <Button type="submit" className="w-full btn-primary-glow" disabled={phoneSignupForm.formState.isSubmitting} data-testid="button-create-phone-account">
                    {phoneSignupForm.formState.isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin mr-2" /> Creating account…</>
                    ) : (
                      <><UserPlus size={16} className="mr-2" /> Create Account</>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setIsPhoneNewUser(false); phoneSignupForm.reset(); }}
                    className="text-sm text-muted-foreground hover:text-foreground text-center transition-colors py-1"
                    data-testid="button-back-phone"
                  >
                    ← Use a different phone number
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
