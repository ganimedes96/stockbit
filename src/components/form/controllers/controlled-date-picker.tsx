"use client";

import type React from "react";

import {
  Controller,
  FieldError,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/shadcn-ui/utils";

interface ControlledDatePickerProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  description?: string;
  placeholder?: string;
  className?: string;
  format?: string;
  showTime?: boolean;
  numberOfMonths?: number;
}

// Separate component for the date picker UI
function DatePicker({
  value,
  onChange,
  placeholder = "Selecione uma data e hora",
  numberOfMonths = 1,
  error,
  inputRef,
  name,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  numberOfMonths?: number;
  error?: FieldError | undefined;
  inputRef: React.Ref<HTMLButtonElement>;
  name: string;
}) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedValue, setSelectedValue] = useState<Date | undefined>(
    undefined
  );

  useEffect(() => {
    if (value) {
      setCurrentMonth(value);
      setSelectedValue(value);
    } else {
      setSelectedValue(undefined);
    }
  }, [value]);

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      if (selectedValue) {
        const newDate = new Date(date);
        onChange(newDate);
        setSelectedValue(newDate);
        setCurrentMonth(newDate);
      } else {
        const newDate = new Date(date);
        newDate.setHours(0);
        newDate.setMinutes(0);
        newDate.setSeconds(0);
        onChange(newDate);
        setSelectedValue(newDate);
        setCurrentMonth(newDate);
      }
    }
  }

  function handleYearChange(year: string) {
    const yearNum = Number.parseInt(year);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(yearNum);
    if (selectedValue) {
      const selectedDate = new Date(selectedValue);
      selectedDate.setFullYear(yearNum);
      onChange(selectedDate);
      setSelectedValue(selectedDate);
    } else {
      const newDate = new Date();
      newDate.setFullYear(yearNum);
      onChange(newDate);
      setSelectedValue(newDate);
    }
    setCurrentMonth(newDate);
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 102 }, (_, i) => currentYear - 100 + i);

  const dateFormat = "dd/MM/yyyy";

  return (
    <Popover>
      <PopoverTrigger asChild type="button" className="w-full pr-3">
        <Button
          id={name}
          ref={inputRef}
          type="button"
          variant={"outline"}
          size={"lg"}
          className={cn(
            "w-full pl-3 text-left font-normal hover:bg-muted",
            !selectedValue && "text-muted-foreground",
            error ? "border-destructive" : ""
          )}
        >
          {selectedValue ? (
            format(selectedValue, dateFormat, { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <div className="flex flex-col">
            <div className="p-3 border-b">
              <Select
                value={currentMonth.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="single"
              selected={selectedValue}
              onSelect={handleDateSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              initialFocus
              numberOfMonths={numberOfMonths}
              locale={ptBR}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ControlledDatePicker<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  description,
  placeholder = "Selecione uma data e hora",
  className,
  numberOfMonths = 1,
}: ControlledDatePickerProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
        <div className={cn("flex flex-col gap-1", className)}>
          <Label className="block text-sm font-medium">
            {label.replace("*", "")}
            {label.includes("*") && (
              <span className="text-destructive ml-1">*</span>
            )}
          </Label>
          <DatePicker
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            numberOfMonths={numberOfMonths}
            error={error}
            inputRef={ref}
            name={name}
          />
          {description && !error && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {error?.message && (
            <p className="text-sm text-destructive">{error.message}</p>
          )}
        </div>
      )}
    />
  );
}