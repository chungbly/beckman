"use client";

import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { captionLayout = "dropdown" } = props;
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row justify-between",
        month: "space-y-4 sm:last:ml-4",
        month_caption: "flex justify-center relative items-center",
        caption_label: `text-sm font-medium ${
          captionLayout === "dropdown" ? "hidden" : ""
        }`,
        nav: "space-x-1 flex items-center justify-between",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_previous: `absolute left-1 top-3 ${
          captionLayout === "dropdown" ? "hidden" : ""
        }`,
        button_next: `absolute right-1 top-3 ${
          captionLayout === "dropdown" ? "hidden" : ""
        }`,
        month_grid: "w-full border-collapse space-y-1",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 rounded-lg flex items-center cursor-pointer justify-center transition-all text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: "w-full h-full",
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        dropdowns: "flex items-center space-x-2 ",
        dropdown: "flex border-0 ring-transparent rounded-lg",
        weekdays: "flex",
        ...classNames,
      }}
      captionLayout="dropdown"
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
