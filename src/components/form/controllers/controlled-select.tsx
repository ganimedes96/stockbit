"use client";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectOption {
  id: string;
  name: string;
}

interface ControlledSelectProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  placeholder: string;
  options?: SelectOption[];
  className?: string;
  loading?: boolean;
  timeDefaultValue?: string;
  disabled?: boolean;
  rightComponent?: React.ReactNode;
}

export function ControlledSelect<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  timeDefaultValue,
  placeholder,
  options,
  className,
  disabled,
  loading,
  rightComponent,
}: ControlledSelectProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
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
          <Select
            disabled={disabled}
            onValueChange={onChange}
            defaultValue={timeDefaultValue}
            value={value ?? timeDefaultValue}
          >
            <SelectTrigger
              id={name}
              ref={ref}
              className={`${error ? "border-destructive" : ""} ${
                className || ""
              }`}
            >
              <SelectValue
                placeholder={loading ? "Carregando..." : placeholder}
              />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error?.message && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}
