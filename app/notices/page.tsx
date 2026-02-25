"use client";

import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { useNotices } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NoticesPage() {
  const { notices, isLoading } = useNotices();

  // Sort notices by date (newest first)
  const sortedNotices = [...notices].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-6jybyzr1r5WRLGCSQ4h5arS8GijNfgo7GA&s"
              alt="CGEC Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg">CGEC</span>
              <span className="text-sm text-muted-foreground">
                Student Portal
              </span>
            </div>
          </Link>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4">Notices & Announcements</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Stay updated with the latest news, academic schedules, and events
            from CGEC. This board updates automatically when new notices are
            posted.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-32 bg-muted/50" />
                <CardContent className="h-24 bg-muted/30 mt-4" />
              </Card>
            ))}
          </div>
        ) : sortedNotices.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/10">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No notices found</h3>
            <p className="text-muted-foreground">
              Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {sortedNotices.map((notice) => (
              <Card
                key={notice.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                        notice.category === "exam"
                          ? "destructive"
                          : notice.category === "academic"
                            ? "default"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {notice.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(notice.publishedAt)}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{notice.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                    {notice.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
