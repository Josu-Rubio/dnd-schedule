"use client";

import DnDCalendar from "@/components/DnDCalendar";
import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    <div>
      <h1>D&D Scheduler</h1>
      <LoginButton />
      <DnDCalendar />
    </div>
  );
}