"use client";

import type React from "react";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Input, type InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type MaskKey,
  type MaskType,
  applyMask,
  mask,
  removeMask,
} from "@/utils/text/mask";
import { useCallback, useMemo } from "react";

interface ControlledInputProps<FormType extends FieldValues>
  extends UseControllerProps<FormType>,
    Omit<InputProps, "name" | "defaultValue"> {
  label: string;
  maskType?: MaskKey;
  customMask?: MaskType;
  placeholder: string;
  rightComponent?: React.ReactNode;
}

export function ControlledInput<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  maskType,
  customMask,
  placeholder,
  rightComponent,
  ...inputProps
}: ControlledInputProps<FormType>) {
  const maskToUse = maskType ? mask[maskType] : customMask;

  const maskedValue = useMemo(() => {
    return (val: string) => (maskToUse ? applyMask(val || "", maskToUse) : val);
  }, [maskToUse]);

  const handleChange = useCallback(
    (onChange: (arg0: string | number) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (maskToUse) {
          const maskedValue = applyMask(newValue, maskToUse);
          const unmaskedValue = removeMask(maskedValue, maskToUse);
          onChange(unmaskedValue);
        } else {
          onChange(inputProps.type === "number" ? +newValue : newValue);
        }
      },
    [maskToUse, inputProps.type]
  );

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
                value={maskedValue(value) || ""}
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
