import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  console.log("cookies", cookies)
  const userCookie = cookies
    .split("; ")
    .find((cookie) => cookie.startsWith("user="));

  if (!userCookie) {
    return NextResponse.json({ error: "User not logged in" }, { status: 401 });
  }

  const user = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));

  return NextResponse.json(user);
}
