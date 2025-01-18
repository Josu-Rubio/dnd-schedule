import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const userCookie = req.cookies.get("user");
  if (!userCookie) {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }

  const user = JSON.parse(userCookie.value);
  return NextResponse.json(user);
}