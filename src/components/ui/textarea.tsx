import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border border-input/60 bg-muted/10 px-4 py-3 text-sm shadow-sm",
        "ring-offset-background placeholder:text-muted-foreground/70",
        "hover:border-primary/50 hover:bg-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary focus-visible:bg-background focus-visible:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 disabled:hover:border-input/60",
        "resize-y transition-all duration-300 ease-in-out",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
