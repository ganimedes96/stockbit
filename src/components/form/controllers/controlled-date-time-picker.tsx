"use client";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/shadcn-ui/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { ptBR } from "date-fns/locale";

interface ControlledDateTimePickerProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  description?: string;
  placeholder?: string;
  className?: string;
  formatDate?: string;
  showTime?: boolean; // New prop to control time display
}

export function ControlledDateTimePicker<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  description,
  placeholder = "Selecione uma data e hora",
  className,
  showTime = true, // Default to true to maintain backward compatibility
  formatDate = "dd/MM/yyyy",
}: ControlledDateTimePickerProps<FormType>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ref }, fieldState: { error } }) => {
        function handleDateSelect(date: Date | undefined) {
          if (date) {
            if (value && showTime) {
              // Only preserve time if showTime is true
              const newDate = new Date(date);
              newDate.setHours(value.getHours());
              newDate.setMinutes(value.getMinutes());
              onChange(newDate);
            } else {
              // If showTime is false, set time to 00:00
              const newDate = new Date(date);
              if (!showTime) {
                newDate.setHours(0);
                newDate.setMinutes(0);
                newDate.setSeconds(0);
              }
              onChange(newDate);
            }
          }
        }

        function handleTimeChange(
          type: "hour" | "minute" | "second",
          val: number
        ) {
          const currentDate = value || new Date();
          const newDate = new Date(currentDate);

          if (type === "hour") {
            newDate.setHours(val);
          } else if (type === "minute") {
            newDate.setMinutes(val);
          } else if (type === "second") {
            newDate.setSeconds(val);
          }
          onChange(newDate);
        }

        // Determine the date format based on showTime
        const dateFormat = showTime ? "dd/MM/yyyy HH:mm" : formatDate;

        return (
          <div className={cn("flex flex-col gap-1", className)}>
            <Label className="block text-sm font-medium">
              {label.replace("*", "")}
              {label.includes("*") && (
                <span className="text-destructive ml-1">*</span>
              )}
            </Label>
            <Popover>
              <PopoverTrigger asChild type="button">
                <Button
                  id={name}
                  ref={ref}
                  type="button"
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !value && "text-muted-foreground",
                    error ? "border-destructive" : ""
                  )}
                >
                  {value ? (
                    format(value, dateFormat, { locale: ptBR })
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <div className="sm:flex">
                  <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleDateSelect}
                    initialFocus
                    locale={ptBR}
                    disabled={{ before: new Date() }}
                  />
                  {showTime && (
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 24 }, (_, i) => i)
                            .reverse()
                            .map((hour) => (
                              <Button
                                key={hour}
                                size="icon"
                                type="button"
                                variant={
                                  value && value.getHours() === hour
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() => handleTimeChange("hour", hour)}
                              >
                                {hour.toString().padStart(2, "0")}
                              </Button>
                            ))}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="sm:hidden"
                        />
                      </ScrollArea>
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 12 }, (_, i) => i * 5).map(
                            (minute) => (
                              <Button
                                key={minute}
                                size="icon"
                                type="button"
                                variant={
                                  value && value.getMinutes() === minute
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange("minute", minute)
                                }
                              >
                                {minute.toString().padStart(2, "0")}
                              </Button>
                            )
                          )}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="sm:hidden"
                        />
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            {description && !error && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {error?.message && (
              <p className="text-sm text-destructive">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
