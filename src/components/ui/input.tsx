import * as React from "react";
import { cn } from "@/lib/shadcn-ui/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconPosition = "left", ...props }, ref) => {
    return (
      <div className=" relative flex items-center w-full">
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        />
        {icon && iconPosition === "right" && (
          <div className="absolute right-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
