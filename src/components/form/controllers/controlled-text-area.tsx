"use client";

import type React from "react";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ControlledTextareaProps<FormType extends FieldValues>
  extends UseControllerProps<FormType>,
    Omit<
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
      "name" | "defaultValue" | "maxLength"
    > {
  label: string;
  placeholder: string;
  rightComponent?: React.ReactNode;
  limit?: number;
}

export function ControlledTextarea<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  placeholder,
  rightComponent,
  limit,
  ...textareaProps
}: ControlledTextareaProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value, ref },
        fieldState: { error },
      }) => {
        const currentLength = String(value || "").length;
        const isApproachingLimit = limit && currentLength >= limit * 0.8;
        const isAtLimit = limit && currentLength >= limit;
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
            <div className="flex flex-col w-full">
              <Textarea
                {...textareaProps}
                id={name}
                placeholder={placeholder}
                onChange={onChange}
                onBlur={onBlur}
                value={value || ""}
                ref={ref}
                maxLength={limit}
                
                className={`max-h-[100px] ${error ? "border-destructive" : ""} ${
                  textareaProps.className || ""
                }`}
              />
              <div className="flex items-center justify-between">
                {error?.message && (
                  <p className="mt-1 w-full text-sm text-destructive">
                    {error.message}
                  </p>
                )}
                {limit && (
                  <div
                    className={`flex justify-end mt-1 ${
                      error?.message ? "" : "w-full"
                    }`}
                  >
                    <span
                      className={`text-xs ${
                        isAtLimit
                          ? "text-destructive font-medium"
                          : isApproachingLimit
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {currentLength}/{limit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}