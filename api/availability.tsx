import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const AvailabilitySchema = new mongoose.Schema({
  userId: String,
  date: String,
  state: String,
});

const Availability = mongoose.models.Availability || mongoose.model("Availability", AvailabilitySchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { userId, date, state } = req.body;
    await mongoose.connect(process.env.MONGODB_URI!);
    await Availability.updateOne({ userId, date }, { state }, { upsert: true });
    res.status(200).json({ message: "Availability saved!" });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
