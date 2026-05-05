import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full bg-transparent text-2xl font-semibold text-white placeholder:text-white/20 focus:outline-none",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
