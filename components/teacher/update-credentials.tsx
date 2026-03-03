"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { updateTeacherAction } from "@/app/teacher/actions";
import { toast } from "sonner";
import { TeacherCredentials } from "@/lib/types";

export function UpdateTeacherCredentials({
  currentCreds,
  onSuccess,
}: {
  currentCreds: TeacherCredentials | null;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await updateTeacherAction(formData);

    if (result.success) {
      setSuccess(true);
      toast.success(
        "Credentials updated successfully. Use these for your next login.",
      );
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || "Something went wrong");
      toast.error(result.error || "Failed to update credentials");
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Teacher Credentials</CardTitle>
            <CardDescription>
              Update your username and password for portal access
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          key={
            currentCreds
              ? `${currentCreds.username}-${currentCreds.password}`
              : "initial"
          }
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Credentials updated! Use the new ones next time you sign in.
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">New Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="Enter new username"
                defaultValue={currentCreds?.username || ""}
                required
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  defaultValue={currentCreds?.password || ""}
                  required
                  autoComplete="new-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Credentials
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
