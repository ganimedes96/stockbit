"use client";

import { type LucideProps } from "lucide-react";
import { type ForwardRefExoticComponent, type RefAttributes } from "react";
import { type FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils"; // Importe sua função de utilitário de classe
import React from "react";

// MUDANÇA 1: A interface Step agora é genérica.
// O T representa o tipo dos dados do seu formulário.
export interface Step<T extends FieldValues = FieldValues> {
  id: number;
  name: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  fields?: (keyof T)[];
  isStepDisabled?: boolean;
}

// MUDANÇA 2: A interface de props do progress bar também se torna genérica.
interface StepProgressBarProps<T extends FieldValues> {
  currentStep: number;
  // E a prop 'steps' agora usa o tipo genérico T
  steps: Step<T>[];
}

// MUDANÇA 3: A própria função do componente agora é genérica.
export function StepProgressBar<T extends FieldValues>({
  currentStep,
  steps,
}: StepProgressBarProps<T>) {
  // A lógica de cálculo da largura da barra precisa de um pequeno ajuste
  // para lidar com o caso de currentStep ser 0.
  // const progressValue =
  //   currentStep >= steps.length - 1
  //     ? 100
  //     : (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  currentStep >= index ? "bg-primary border-primary text-primary-foreground" : "bg-muted"
                )}
              >
                <step.icon className="h-5 w-5" />
              </div>
              <span className="text-xs text-center font-semibold max-sm:hidden">{step.name}</span>
            </div>
            {/* Não renderiza a linha depois do último item */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 bg-border rounded-full mx-2" />
            )}
          </React.Fragment>
        ))}
      </div>

    </div>
  );
}