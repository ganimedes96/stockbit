/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { type DefaultValues, FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Step, StepProgressBar } from "./step-progress-bar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FormProps<T, R> {
  children: React.ReactNode;
  steps?: Step[];
  onSubmit: (data: T) => Promise<R>;
  initialData?: Partial<T>;
  buttonTitle?: string;
  reset?: boolean;
  // Novas props para o Sheet
  sheetTitle?: string;
  sheetDescription?: string;
  triggerButtonText?: string;
  triggerButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  triggerButtonSize?: "default" | "sm" | "lg" | "icon";
  customTrigger?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  onOpenChange?: (open: boolean) => void;
}

export function GlobalFormSheet<
  T extends Record<string, any>,
  R extends { status: string; message: string }
>({
  children,
  steps = [],
  onSubmit,
  initialData,
  buttonTitle = "Finalizar",
  reset = true,
  sheetTitle = "Formulário",
  sheetDescription = "Preencha os campos abaixo",
  triggerButtonText = "Abrir Formulário",
  triggerButtonVariant = "default",
  triggerButtonSize = "default",
  customTrigger,
  side = "right",
  onOpenChange,
}: FormProps<T, R>) {
  const methods = useForm<T>({
    defaultValues: initialData as DefaultValues<T>,
    mode: "onChange",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      methods.reset(initialData as DefaultValues<T>);
    }
  }, [initialData, methods]);

  const goToPreviousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const isStepValid = async () => {
    return await methods.trigger();
  };

  const handleNextStep = async () => {
    const isValid = await isStepValid();
    if (isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        await handleSubmitForm();
      }
    }
  };

  const handleSubmitForm = methods.handleSubmit(async (data) => {
    try {
      const response = await onSubmit(data);
      if (response.status === "success") {
        if (reset) methods.reset();
        if (steps.length > 0) {
          setCurrentStep(0);
        }
        setOpen(false); // Fecha o sheet após o sucesso
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao finalizar");
    }
  });

  const toggleSheet = (open: boolean) => {
    setOpen(open);
    if (onOpenChange) {
      onOpenChange(open);
    }
    // Reseta o formulário quando o sheet é fechado
    if (!open) {
      methods.reset();
      setCurrentStep(0);
    }
  };

  return (
    <Sheet open={open} onOpenChange={toggleSheet}>
      <SheetTrigger asChild>
        {customTrigger || (
          <Button variant={triggerButtonVariant} size={triggerButtonSize}>
            {triggerButtonText}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side={side} className="sm:max-w-md w-full">
        <SheetHeader className="pb-4">
          <SheetTitle>{sheetTitle}</SheetTitle>
          <SheetDescription>{sheetDescription}</SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col gap-6 w-full overflow-y-auto max-h-[calc(100vh-8rem)]">
          {steps.length > 0 && (
            <StepProgressBar currentStep={currentStep + 1} steps={steps} />
          )}
          <Card>
            <CardContent>
              <FormProvider {...methods}>
                <div className="flex flex-col">
                  <div className="gap-6 py-6 px-2">
                    {React.Children.toArray(children)[currentStep]}
                  </div>
                  <div className="flex sm:flex-row flex-col justify-between gap-6 mt-4">
                    {steps.length > 0 && currentStep > 0 && (
                      <Button
                        onClick={goToPreviousStep}
                        variant="outline"
                        className="w-full"
                        disabled={methods.formState.isSubmitting}
                      >
                        Voltar
                      </Button>
                    )}
                    {steps.length > 0 && currentStep < steps.length - 1 && (
                      <Button
                        onClick={handleNextStep}
                        className="w-full"
                        disabled={methods.formState.isSubmitting}
                      >
                        Próximo
                      </Button>
                    )}
                    {(steps.length === 0 || currentStep === steps.length - 1) && (
                      <Button
                        onClick={handleSubmitForm}
                        className="w-full"
                        disabled={methods.formState.isSubmitting}
                        loading={methods.formState.isSubmitting}
                        titleLoading="Finalizando..."
                      >
                        {buttonTitle}
                      </Button>
                    )}
                  </div>
                </div>
              </FormProvider>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}