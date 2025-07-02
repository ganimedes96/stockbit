"use client";

import { PartyPopper } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function BirthdayIndicator({
  date,
  name,
}: {
  date?: Date;
  name: string;
}) {
  if (!date) return null;

  const today = new Date();
  const birthDate = new Date(date);
  const isToday =
    birthDate.getDate() === today.getDate() &&
    birthDate.getMonth() === today.getMonth();

  if (!isToday) return null;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs ml-2 animate-pulse">
            <PartyPopper className="h-3 w-3 mr-1" />
            Hoje!
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Feliz aniversário, {name.split(" ")[0]}! 🎂
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
