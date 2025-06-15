"use client";

import type React from "react";

import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CheckboxOption {
  id: string | number;
  name: string;
}

interface ControlledCheckboxGroupProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  options: CheckboxOption[];
  className?: string;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
  description?: string;
}

export function ControlledCheckbox<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  options,
  className,
  disabled,
  rightComponent,
  description,
}: ControlledCheckboxGroupProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value = 0 }, fieldState: { error } }) => {
        const handleCheckedChange = (
          checked: boolean,
          option: CheckboxOption
        ) => {
          onChange(checked ? option.id : null);
        };

        return (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <Label htmlFor={name} className="block text-sm font-medium">
                {label.replace("*", "")}
                {label.includes("*") && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {rightComponent && rightComponent}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mb-2">
                {description}
              </p>
            )}
            <div className="flex flex-col flex-wrap gap-1">
              {options.map((option) => (
                <div key={option.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`${name}-${option.id}`}
                    checked={value === option.id}
                    onCheckedChange={(checked) =>
                      handleCheckedChange(checked as boolean, option)
                    }
                    disabled={disabled}
                    className={`${error ? "border-destructive" : ""} ${
                      className || ""
                    }`}
                  />
                  <Label
                    htmlFor={`${name}-${option.id}`}
                    className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.name}
                  </Label>
                </div>
              ))}
            </div>
            {error?.message && (
              <p className="text-sm text-destructive mt-1">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
