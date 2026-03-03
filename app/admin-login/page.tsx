"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer logic for OTP Resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Rate limiting on client side
    if (timeLeft > 0) {
      toast.error(`Please wait ${timeLeft} seconds before resending OTP`);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("OTP Send Response:", data);

      if (!res.ok) {
        throw new Error(data.details || data.error || "Failed to send OTP");
      }

      toast.success(data.message || "OTP sent successfully!");
      console.log("Switching to OTP step...");
      setStep("otp");
      setTimeLeft(60); // Start 60s cooldown
      setAttempts(0); // Reset attempts on new OTP
      setOtp(""); // Clear OTP field
    } catch (error: any) {
      console.error("OTP Send Error:", error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Verifying OTP:", otp);
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      console.log("OTP Verify Response:", data);

      if (!res.ok) {
        // Increment local attempt counter if failed (for UI feedback)
        setAttempts((prev) => prev + 1);
        throw new Error(data.error || "Failed to verify OTP");
      }

      toast.success("Login successful! Redirecting...");
      router.push("/admin");
    } catch (error: any) {
      console.error("OTP Verify Error:", error);
      toast.error(error.message);
      if (attempts >= 2) {
        toast.error("Too many failed attempts. Request a new OTP.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-primary overflow-hidden">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4 relative">
            {step === "otp" && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-0 top-0 h-8 w-8 rounded-full"
                onClick={() => {
                  console.log("Going back to email step");
                  setStep("email");
                  setOtp("");
                  setAttempts(0);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {step === "email" ? (
                <ShieldCheck className="h-6 w-6 text-primary" />
              ) : (
                <Lock className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {step === "email" ? "Admin Portal" : "Verify OTP"}
          </CardTitle>
          <CardDescription>
            {step === "email"
              ? "Secure access for authorized administrators only"
              : `Enter the 6-digit code sent to ${email}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@cgec.org.in"
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your registered admin email to receive a login OTP.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-4 flex flex-col items-center">
                <div className="flex flex-col items-center gap-2 w-full">
                  <label
                    htmlFor="otp"
                    className="text-sm font-medium self-start"
                  >
                    One-Time Password
                  </label>
                  <div className="py-2 w-full flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      disabled={isLoading || attempts >= 3}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {/* Fallback standard input in case InputOTP is failing to render or capture input */}
                  <div className="w-full mt-2 hidden sm:block">
                    <p className="text-[10px] text-center text-muted-foreground mb-1">
                      (Or type here if boxes don't work)
                    </p>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="h-8 text-center text-xs tracking-widest font-mono"
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                  <span>
                    Valid for <strong>5 minutes</strong>
                  </span>
                  {attempts > 0 && (
                    <span className="text-red-500 font-medium flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {3 - attempts} attempts left
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={isLoading || attempts >= 3 || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>

              <div className="flex flex-col gap-2 text-center">
                <div className="text-xs text-muted-foreground mb-1">
                  Didn't receive the code?
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs w-full h-9"
                  onClick={() => handleSendOtp()}
                  type="button"
                  disabled={timeLeft > 0 || isLoading}
                >
                  {timeLeft > 0
                    ? `Resend OTP in ${timeLeft}s`
                    : "Resend OTP Now"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-9 mt-2"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setAttempts(0);
                  }}
                  type="button"
                >
                  Change Email Address
                </Button>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t bg-gray-50/50 py-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3" /> Protected by enterprise-grade security
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
