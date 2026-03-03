import mongoose, { Schema, models, model } from "mongoose";

const otpSchema = new Schema({
  email: { type: String, required: true },
  otpHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
});

export default models.Otp || model("Otp", otpSchema);
