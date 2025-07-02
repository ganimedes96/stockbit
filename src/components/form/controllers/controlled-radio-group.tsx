"use client";

import { Controller, type FieldValues, type UseControllerProps } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import React, { type ForwardRefExoticComponent, type RefAttributes } from "react";
import { type LucideProps } from "lucide-react";

// Define a estrutura de cada opção que o componente irá receber
interface RadioOption {
  value: string;
  label: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
}

// Define as props do nosso novo componente
interface ControlledRadioGroupProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  options: RadioOption[];
  className?: string;
  disabled?: boolean;
  displayAs?: 'radio' | 'card'; // Nova prop!
}

export function ControlledRadioGroup<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  options,
  className,
  disabled,
  displayAs = 'radio', // Valor padrão é 'radio' para não quebrar implementações existentes
}: ControlledRadioGroupProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className={`space-y-2 ${className}`}>
          <Label className="text-sm font-medium">
            {label.replace("*", "")}
            {label.includes("*") && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>

          {/* RENDERIZAÇÃO CONDICIONAL BASEADA NA PROP 'displayAs' */}
          
          {displayAs === 'card' ? (
            // --- RENDERIZAÇÃO COMO CARDS ---
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {options.map((option) => (
                <Card
                  key={option.value}
                  onClick={() => !disabled && onChange(option.value)}
                  className={cn(
                    "transition-all",

                    disabled ? "bg-muted/50 cursor-not-allowed" : "cursor-pointer hover:border-primary",
                    value === option.value && "border-2 border-primary bg-primary/10 ring-2 ring-primary/20"
                  )}
                >
                  <CardContent className="flex items-center p-4 gap-3">
                    {option.icon && <option.icon className="h-6 w-6 text-muted-foreground" />}
                    <span className="font-semibold">{option.label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // --- RENDERIZAÇÃO COMO RÁDIO PADRÃO ---
            <RadioGroup
              onValueChange={onChange}
              value={value}
              disabled={disabled}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <Label htmlFor={`${name}-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {error?.message && (
            <p className="text-sm font-medium text-destructive mt-2">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}