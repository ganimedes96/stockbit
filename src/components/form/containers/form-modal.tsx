"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button, type ButtonProps } from "@/components/ui/button";

interface FormModalProps<T extends object> {
  title: string;
  description: string;
  formComponent: React.ComponentType<T & { onSuccess: () => void }>;
  formProps: T;
  buttonText?: string;
  buttonVariant?: ButtonProps["variant"];
  buttonSize?: ButtonProps["size"];
  className?: string;
  onOpenChange?: (open: boolean) => void;
  customButton?: React.ReactNode;
}

export function FormModal<T extends object>({
  title,
  buttonText = "Open Form",
  buttonVariant = "outline",
  buttonSize = "sm",
  formComponent: FormComponent,
  formProps,
  className,
  description,
  customButton,
  onOpenChange,
}: FormModalProps<T>) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const enhancedFormProps = {
    ...formProps,
    onSuccess: handleSuccess,
  };

  const toggleModal = (newOpenState: boolean) => {
    setOpen(newOpenState);
    if (onOpenChange) {
      onOpenChange(newOpenState);
    }
  };

  return (
    <Dialog open={open} onOpenChange={toggleModal}>
      <DialogTrigger asChild>
        {customButton || (
          <Button size={buttonSize} variant={buttonVariant}>
            {buttonText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className={className || "sm:max-w-[900px]"}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <FormComponent {...enhancedFormProps} />
      </DialogContent>
    </Dialog>
  );
}
