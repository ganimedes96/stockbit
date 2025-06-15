"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Controller,
  type FieldValues,
  type UseControllerProps,
} from "react-hook-form";
import { cn } from "@/lib/shadcn-ui/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface ComboboxOption {
  id: string;
  name: string;
}

interface ControlledComboboxProps<FormType extends FieldValues>
  extends UseControllerProps<FormType> {
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  options?: ComboboxOption[];
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  width?: number | string;
  rightComponent?: React.ReactNode;
}

export function ControlledCombobox<FormType extends FieldValues>({
  control,
  name,
  rules,
  label,
  placeholder,
  searchPlaceholder = "Pesquisar...",
  noOptionsMessage = "Nenhuma opção encontrada.",
  options = [],
  className,
  disabled,
  loading,
  width = "100%",
  rightComponent,
}: ControlledComboboxProps<FormType>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => {
        const selectedOption = options.find((option) => option.id === value);

        return (
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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={disabled}
                  onClick={() => setOpen(!open)}
                  className={cn(
                    "justify-between text-muted-foreground",
                    error ? "border-destructive" : "",
                    className
                  )}
                  icon={
                    <ChevronsUpDown className=" h-4 w-4 shrink-0 opacity-50" />
                  }
                  iconPosition="right"
                  style={{ width: width }}
                >
                  {loading
                    ? "Carregando..."
                    : selectedOption?.name || placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 " style={{ width: width }}>
                <Command className="w-[--radix-popover-trigger-width] ">
                  <CommandInput placeholder={searchPlaceholder} />
                  <CommandList className="max-h-60 overflow-y-auto">
                    <CommandEmpty>{noOptionsMessage}</CommandEmpty>
                    <CommandGroup className="">
                      {options.map((option) => (
                        <CommandItem
                          key={option.id}
                          value={option.name}
                          onSelect={() => {
                            onChange(value === option.id ? "" : option.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {option.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {error?.message && (
              <p className="text-sm text-destructive">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
}
