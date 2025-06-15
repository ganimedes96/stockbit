/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { type DefaultValues, FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "react-toastify";
import { Step, StepProgressBar } from "./step-progress-bar";

interface FormProps<T, R> {
  children: React.ReactNode;
  steps?: Step[];
  onSubmit: (data: T) => Promise<R>;
  initialData?: Partial<T>;
  buttonTitle?: string;
  reset?: boolean;
}

export function GlobalForm<
  T extends Record<string, any>,
  R extends { status: string; message: string }
>({
  children,
  steps = [],
  onSubmit,
  initialData,
  buttonTitle = "Finalizar",
  reset = true,
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
    <div className="flex flex-col gap-6 p-6 w-full ">
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
              <div className="flex sm:flex-row  flex-col justify-between gap-6 mt-4">
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
  );
}
