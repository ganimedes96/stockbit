"use client"

import type React from "react"

import { Controller, type FieldValues, type UseControllerProps } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface ButtonOption {
  id: string
  name: string
}

interface ControlledButtonProps<FormType extends FieldValues> extends UseControllerProps<FormType> {
  label: string
  options?: ButtonOption[]
  className?: string
  loading?: boolean
  disabled?: boolean
  rightComponent?: React.ReactNode
  buttonClassName?: string
  columns?: number
}

export function ControlledButton<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  options,
  className,
  disabled,
  loading,
  rightComponent,
  buttonClassName = "",
  columns = 3,
}: ControlledButtonProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className={`flex flex-col gap-1 ${className || ""}`}>
          <div className="flex justify-between items-center">
            <Label htmlFor={name} className="block text-sm font-medium">
              {label.replace("*", "")}
              {label.includes("*") && <span className="text-destructive ml-1">*</span>}
            </Label>
            {rightComponent && rightComponent}
          </div>

          <div className={`grid grid-cols-${columns} gap-2`}>
            {loading ? (
              <div className="col-span-full text-center py-2 text-muted-foreground">Carregando...</div>
            ) : (
              options?.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant={value === option.id ? "default" : "outline"}
                  className={`w-full ${
                    value === option.id ? "bg-primary text-primary-foreground" : ""
                  } ${buttonClassName}`}
                  disabled={disabled}
                  onClick={() => onChange(option.id)}
                >
                  {option.name}
                </Button>
              ))
            )}
          </div>

          {error?.message && <p className="text-sm text-destructive">{error.message}</p>}
        </div>
      )}
    />
  )
}
