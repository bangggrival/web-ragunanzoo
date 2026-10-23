import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto select-none relative", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 items-center justify-center relative",
        month: "relative space-y-3 w-full max-w-[280px] mx-auto",
        month_caption: "flex justify-center items-center h-8 relative mb-2 px-8 w-full",
        caption_label: "text-sm font-bold text-foreground tracking-wide capitalize",
        nav: "flex items-center justify-between absolute inset-x-0 top-0 h-8 z-10 pointer-events-none px-1 w-full",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-card border border-border p-0 opacity-80 hover:opacity-100 hover:bg-primary hover:text-white text-foreground z-20 rounded-full shadow-sm pointer-events-auto flex items-center justify-center transition-all cursor-pointer absolute left-1 top-0"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-card border border-border p-0 opacity-80 hover:opacity-100 hover:bg-primary hover:text-white text-foreground z-20 rounded-full shadow-sm pointer-events-auto flex items-center justify-center transition-all cursor-pointer absolute right-1 top-0"
        ),
        month_grid: "border-collapse space-y-1 mx-auto w-full",
        weekdays: "flex gap-1 justify-center",
        weekday: "text-muted-foreground rounded-md w-9 font-semibold text-[0.8rem] text-center flex items-center justify-center",
        week: "flex gap-1 mt-1 justify-center",
        day: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium rounded-xl transition-all aria-selected:!bg-primary aria-selected:!text-white aria-selected:!opacity-100 aria-selected:!border-primary aria-selected:shadow-md aria-selected:scale-105",
        ),
        range_end: "day-range-end",
        selected:
          "!bg-primary !text-white font-bold rounded-xl shadow-md scale-105",
        today: "border-2 border-primary text-primary font-bold rounded-xl",
        outside:
          "outside text-muted-foreground opacity-30 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4 text-foreground stroke-[2.5]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-foreground stroke-[2.5]" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
