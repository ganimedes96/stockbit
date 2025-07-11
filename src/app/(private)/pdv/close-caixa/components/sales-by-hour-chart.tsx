"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/text/format";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Importando o Tooltip do Shadcn

interface SalesByHourChartProps {
  salesData: Record<string, number>;
  startHour?: number;
  endHour?: number;
}

export function SalesByHourChart({ 
  salesData = {}, 
  startHour = 8, 
  endHour = 22 
}: SalesByHourChartProps) {

  const maxAmount = Math.max(...Object.values(salesData), 0);
  const hoursToDisplay = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendas por Horário</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
            className="grid gap-x-2 gap-y-1 items-end"
            // O número de colunas do grid agora é dinâmico, baseado nas horas
            style={{ gridTemplateColumns: `repeat(${hoursToDisplay.length}, minmax(0, 1fr))` }}
        >
          {hoursToDisplay.map((hour) => {
            const hourKey = hour.toString().padStart(2, "0");
            const amount = salesData[hourKey] || 0;
            const heightPercentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

            return (
              <div key={hourKey} className="flex flex-col items-center gap-1 text-center">
                {/* 1. O valor da venda agora é exibido aqui */}
                <div className="h-6 text-xs font-semibold text-muted-foreground">
                  {amount > 0 ? formatCurrency(amount) : ""}
                </div>
                
                {/* 2. A barra agora usa um Tooltip do Shadcn para uma melhor experiência */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="bg-muted h-28 flex w-full items-end justify-center  group">
                        <div
                          className="bg-blue-500 w-full  transition-all duration-300 group-hover:bg-blue-600"
                          style={{ 
                            height: `${heightPercentage}%`,
                            // Adiciona uma altura mínima para que a barra seja visível mesmo com valores pequenos
                            minHeight: amount > 0 ? "2px" : "0px"
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-500 text-primary-foreground">
                      <p>{formatCurrency(amount)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* 3. O rótulo da hora continua na base */}
                <div className="text-xs font-medium bg-gray-200 dark:bg-gray-600 w-full py-1 rounded-b-md">
                  {hourKey}h
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}