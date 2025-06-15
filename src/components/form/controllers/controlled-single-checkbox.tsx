"use client";

import { Controller, type FieldValues, type UseControllerProps } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ControlledSingleCheckboxProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  className?: string;
  disabled?: boolean;
}

export function ControlledSingleCheckbox<FormType extends FieldValues>({
  control,
  name,
  label,
  rules,
  className,
  disabled,
}: ControlledSingleCheckboxProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={name}
            checked={!!value}
            onCheckedChange={onChange}
            disabled={disabled}
            className={`${error ? "border-destructive" : ""} ${className || ""}`}
          />
          <Label
            htmlFor={name}
            className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </Label>
        </div>
      )}
    />
  );
}
