"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react" // Renomeado para evitar conflito
import { format } from "date-fns"
import { ptBR } from "date-fns/locale" // Para formatar a data em português

import { cn } from "@/lib/utils" // Utilitário do Shadcn
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// 1. A interface de props agora define o que o componente espera receber do pai
interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  label?: string;
}

export function DatePicker({ date, setDate, label = "Selecione uma data" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  // 2. O estado interno 'date' foi removido. Agora usamos as props.

  return (
    <div className="w-full flex flex-col gap-1.5">
      <Label htmlFor="date" className="px-1 font-medium">
        {label}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {/* 3. A data exibida agora vem da prop 'date' e é formatada */}
            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date} // O calendário é controlado pela prop 'date'
            // 4. Ao selecionar, chama a função 'setDate' da prop e fecha o popover
            onSelect={(newDate) => {
              setDate(newDate)
              setOpen(false)
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
