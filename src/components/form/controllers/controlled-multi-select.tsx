"use client";

import React from "react";
import { Controller, FieldValues, UseControllerProps } from "react-hook-form";
import { MultiSelect as UiMultiSelect } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";

interface Option {
  id: string | number;
  name: string;
  icon?: React.ComponentType<{
    className?: string;
  }>;
}

interface ControlledMultiSelectProps<FormType extends FieldValues>
  extends Omit<UseControllerProps<FormType>, "defaultValue"> {
  label: string;
  options?: Option[];
  placeholder?: string;
  variant?: "default" | "inverted";
  maxCount?: number;
  loading?: boolean;
}

export function ControlledMultiSelect<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  options = [],
  placeholder = "Selecione uma opção",
  variant = "inverted",
  maxCount,
  loading,
}: ControlledMultiSelectProps<FormType>) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={name} className="block text-sm font-medium">
        {label.replace("*", "")}
        {label.includes("*") && (
          <span className="text-destructive ml-1">*</span>
        )}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState: { error } }) => {
          return (
            <div className="flex flex-col gap-1">
              <UiMultiSelect
                ref={field.ref}
                options={options}
                onValueChange={field.onChange}
                value={field.value ? String(field.value) : [""]}
                defaultValue={
                  field.value
                    ? field.value.map((value: number | string) => String(value))
                    : []
                }
           
                placeholder={loading ? "Carregando..." : placeholder}
                variant={variant}
                maxCount={maxCount}
                className={`${
                  error ? "border-destructive" : ""
                } hover:bg-secondary`}
              />
              {error && (
                <p className="text-sm text-destructive">{error.message}</p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}