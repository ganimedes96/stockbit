import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import type { VariantProps } from "class-variance-authority";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/lib/shadcn-ui/button/variant";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
  titleLoading?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      icon,
      iconPosition = "left",
      loading = false,
      titleLoading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {titleLoading || children}
          </>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <span className="mr-2">{icon}</span>
            )}
            {children}
            {icon && iconPosition === "right" && (
              <span className="ml-2">{icon}</span>
            )}
          </>
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
