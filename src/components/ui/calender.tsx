"use client";

import * as React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";

type CalendarProps = DayPickerProps & {
  className?: string;
  captionLayout?: "dropdown" | "label" | "dropdown-months" | "dropdown-years";
};

export function Calendar({ className, captionLayout = "dropdown", ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("rounded-md border p-3 shadow-sm bg-background", className)}
      captionLayout={captionLayout}
      {...props}
    />
  );
}
