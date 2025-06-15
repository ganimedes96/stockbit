"use client";

import type React from "react";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ControlledCurrencyInputProps<FormType extends FieldValues>
  extends UseControllerProps<FormType>,
    Omit<InputProps, "name" | "defaultValue"> {
  label: string;
  placeholder: string;
  rightComponent?: React.ReactNode;
}

export function ControlledCurrencyInput<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  placeholder,
  rightComponent,
  ...inputProps
}: ControlledCurrencyInputProps<FormType>) {
  const formatCurrency = (value: string | number | undefined): string => {
    if (!value) return "";
    
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace(/\D/g, '')) / 100 
      : Number(value);
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const parseCurrency = (value: string): number => {
    const digitsOnly = value.replace(/\D/g, '');
    return digitsOnly ? parseFloat(digitsOnly) / 100 : 0;
  };

  const handleChange = (onChange: (value: number) => void) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const formattedValue = e.target.value;
      const numericValue = parseCurrency(formattedValue);
      onChange(numericValue);
    };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value, ref },
        fieldState: { error },
      }) => {
        return (
          <div className={"flex flex-col gap-1"}>
            <div className="flex justify-between items-center">
              <Label htmlFor={name} className="block text-sm font-medium">
                {label.replace("*", "")}
                {label.includes("*") && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              {rightComponent && rightComponent}
            </div>
            <div className="flex items-center justify-between relative">
              <Input
                {...inputProps}
                id={name}
                placeholder={placeholder}
                onChange={handleChange(onChange)}
                onBlur={onBlur}
                value={formatCurrency(value)}
                ref={ref}
                className={`${error ? "border-destructive" : ""} ${
                  inputProps.className || ""
                }`}
              />
            </div>

            {error?.message && (
              <p className="mt-1 text-sm text-destructive">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}