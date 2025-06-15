"use client";

import type React from "react";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button, type ButtonProps } from "@/components/ui/button";

interface FormSheetProps {
  title: string;
  buttonText?: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formComponent: React.ComponentType<any>;
  formProps: Record<string, unknown>;
  className?: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
  onOpenChange?: (open: boolean) => void;
  customButton?: React.ReactNode;
}

export function FormSheet({
  title,
  buttonText = "Cadastrar",
  buttonVariant = "outline",
  buttonSize = "sm",
  formComponent: FormComponent,
  formProps,
  className,
  description,
  side = "right",
  customButton,
  onOpenChange,
}: FormSheetProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };
  const enhancedFormProps = {
    ...formProps,
    onSuccess: handleSuccess,
  };

  const toggleSheet = () => {
    setOpen(!open);
    if (onOpenChange) {
      onOpenChange(!open);
    }
  };

  return (
    <Sheet open={open} onOpenChange={toggleSheet}>
      <SheetTrigger asChild>
        {customButton || (
          <Button  size={buttonSize} variant={buttonVariant}>
            {buttonText}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side={side} className={className || "sm:max-w-xl w-full"} >
        <SheetHeader className="pb-4">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <FormComponent {...enhancedFormProps} />
      </SheetContent>
    </Sheet>
  );
}
