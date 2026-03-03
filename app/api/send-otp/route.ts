import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import { ALLOWED_ADMINS } from "@/lib/admins";
import { headers } from "next/headers";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5; // Max 5 requests per window

export async function POST(req: Request) {
  const { email } = await req.json();

  // 1. Get IP Address (works on Vercel/Next.js)
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";

  // 2. Check Rate Limit
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (record) {
    if (now > record.resetTime) {
      // Reset if window passed
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    } else {
      if (record.count >= MAX_REQUESTS) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 },
        );
      }
      record.count += 1;
    }
  } else {
    // New IP record
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }

  // Cleanup old records periodically (optional optimization)
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  if (!ALLOWED_ADMINS.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error("Database connection failed:", dbError.message);
      return NextResponse.json(
        {
          error: "Database Connection Error",
          details:
            "Could not reach MongoDB Atlas. This is usually caused by IP whitelisting. Please add '0.0.0.0/0' in your Atlas Network Access settings.",
        },
        { status: 500 },
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP for", email, ":", otp); // Log OTP for dev
    const otpHash = await bcrypt.hash(otp, 10);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email },
      { otpHash, expiresAt, attempts: 0 },
      { upsert: true },
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `"CGEC Admin Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Admin Login OTP",
        html: `<h2>Your OTP: ${otp}</h2><p>Valid for 5 minutes</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      // Allow proceeding in development even if email fails
      // This allows testing the flow using the console logged OTP
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({ message: "OTP generated (Check console)" });
      }

      return NextResponse.json(
        { error: "Failed to send email." },
        { status: 500 },
      );
    }

    return NextResponse.json({ message: "OTP sent" });
  } catch (error: any) {
    console.error("Error in send-otp:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
