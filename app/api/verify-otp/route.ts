import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Otp from "@/models/Otp";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ALLOWED_ADMINS } from "@/lib/admins";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (!ALLOWED_ADMINS.includes(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error("Database connection failed during verification:", dbError);
      return NextResponse.json(
        { error: `Database Error: ${dbError.message || "Connection failed"}. Check if your IP is whitelisted in Atlas.` },
        { status: 500 },
      );
    }

    const record = await Otp.findOne({ email });

    if (!record)
      return NextResponse.json({ error: "No OTP found" }, { status: 400 });

    if (record.expiresAt < new Date())
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });

    if (record.attempts >= 3)
      return NextResponse.json({ error: "Too many attempts" }, { status: 403 });

    const isMatch = await bcrypt.compare(otp, record.otpHash);

    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    await Otp.deleteOne({ email });

    const secret = process.env.JWT_SECRET || "default-secret-key-change-me";
    const token = jwt.sign({ email, role: "admin" }, secret, {
      expiresIn: "2h",
    });

    const cookieStore = await cookies();
    cookieStore.set("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return NextResponse.json({ message: "Login successful" });
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
