"use client";

import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ControlledSwitchProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  className?: string;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
}

export function ControlledSwitch<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  className,
  disabled,
  rightComponent,
}: ControlledSwitchProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <div className="flex flex-row gap-2">
              <Switch
                id={name}
                ref={ref}
                checked={value}
                onCheckedChange={onChange}
                disabled={disabled}
                className={className}
              />
          <div className="flex  justify-between items-center">
            <Label htmlFor={name} className="block text-sm font-medium">
              {label.replace("*", "")}
              {label.includes("*") && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            {rightComponent}
          </div>


          {error?.message && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}
