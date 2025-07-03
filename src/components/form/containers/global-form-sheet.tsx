/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { type DefaultValues, FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
  triggerTitle?: string;
  trigger?: React.ReactNode; // aqui!
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
  triggerTitle = "Abrir formulário",
  trigger, // aqui!
}: FormProps<T, R>) {
  const methods = useForm<T>({
    defaultValues: initialData as DefaultValues<T>,
    mode: "onChange",
  });

  useEffect(() => {
    if (initialData) {
      methods.reset(initialData as DefaultValues<T>);
    }
  }, [initialData, methods]);

  const [currentStep, setCurrentStep] = useState(0);

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
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao finalizar");
    }
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? <Button>{triggerTitle}</Button>}
      </SheetTrigger>

      <SheetContent className="overflow-y-auto sm:max-w-[600px] w-full">
        <SheetHeader className="flex flex-col gap-4">
          <div>
            
          <SheetTitle>Carrinho de Compras</SheetTitle>
          <SheetDescription>
            Siga os passos abaixo para finalizar a compra
          </SheetDescription>
          </div>
          {steps.length > 0 && (
            <StepProgressBar currentStep={currentStep} steps={steps} />
          )}
        </SheetHeader>

        <FormProvider {...methods}>
          <div className="flex flex-col gap-6 py-6">
            <div className="gap-6">
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
                  className="w-full disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    methods.formState.isSubmitting ||
                    steps[currentStep]?.isStepDisabled
                  }
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
      </SheetContent>
    </Sheet>
  );
}
