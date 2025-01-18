"use client";

import { useState } from "react";
import Calendar from "react-calendar";

type DayState = "none" | "green" | "yellow";

export default function DnDCalendar() {
  const [selectedDays, setSelectedDays] = useState<Record<string, DayState>>({});

  const toggleDayState = (date: Date) => {
    const dayKey = date.toISOString().split("T")[0];
    setSelectedDays((prev) => {
      const currentState = prev[dayKey] || "none";
      const nextState = currentState === "none" ? "green" : currentState === "green" ? "yellow" : "none";
      return { ...prev, [dayKey]: nextState };
    });
  };

  return (
    <Calendar
      onClickDay={toggleDayState}
      tileContent={({ date }) => {
        const dayKey = date.toISOString().split("T")[0];
        const state = selectedDays[dayKey];
        return state === "green" ? "🟩" : state === "yellow" ? "🟨" : null;
      }}
    />
  );
}
