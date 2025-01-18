import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const userCookie = cookies
    .split("; ")
    .find((cookie) => cookie.startsWith("user="));
  const user = userCookie ? JSON.parse(decodeURIComponent(userCookie.split("=")[1])) : null;
  console.log("user", user)
  if (!user) {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }

  return NextResponse.json(user);
}