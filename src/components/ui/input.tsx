import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-input/60 bg-muted/10 px-4 py-2.5 text-sm ring-offset-background shadow-sm",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground/70",
          "hover:border-primary/50 hover:bg-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary focus-visible:bg-background focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 disabled:hover:border-input/60",
          "transition-all duration-300 ease-in-out",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
