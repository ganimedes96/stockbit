/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  type DefaultValues,
  FormProvider,
  useForm,
  type FieldPath,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Step, StepProgressBar } from "./step-progress-bar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import get from 'lodash.get'; // Importe o 'get' do lodash
// A interface de props agora recebe o schema de validação
interface FormProps<T extends Record<string, any>, R> {
  children: React.ReactNode;
  steps?: Step<T>[];
  onSubmit: (data: T) => Promise<R>;
  schema?: z.ZodTypeAny; // Prop para o schema Zod
  initialData?: Partial<T>;
  buttonTitle?: string;
  resetOnClose?: boolean;
  sheetTitle?: string;
  sheetDescription?: string;
  customTrigger?: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function GlobalFormSheet<
  T extends Record<string, any>,
  R extends { status: string; message: string }
>({
  children,
  steps = [],
  onSubmit,
  schema, // Recebe o schema como prop
  initialData,
  buttonTitle = "Finalizar",
  resetOnClose = true,
  sheetTitle = "Formulário",
  sheetDescription = "Preencha os campos abaixo",
  customTrigger,
  side = "right",
  onOpenChange,
  className,
}: FormProps<T, R>) {
  // O 'resolver' agora usa o schema passado via props
  const methods = useForm<T>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: initialData as DefaultValues<T>,
    mode: "onBlur", // onBlur funciona bem com validação por trigger
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);

  // Efeito para resetar o formulário se os dados iniciais mudarem (para edição)
  useEffect(() => {
    if (open && initialData) {
      methods.reset(initialData as DefaultValues<T>);
    }
  }, [open, initialData, methods]);

  const goToPreviousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // LÓGICA DE VALIDAÇÃO POR PASSO ATUALIZADA
   const handleNextStep = async () => {
    const fieldsToValidate = steps[currentStep]?.fields as FieldPath<T>[] | undefined;

    // 1. Acionamos a validação. O objetivo principal agora é popular o objeto 'formState.errors'.
    await methods.trigger(fieldsToValidate);

    // 2. Após o trigger, o formState.errors está atualizado. Pegamos ele.
    const errors = methods.formState.errors;

    // 3. Verificamos se algum dos campos que DEVEM ser válidos para este passo possui um erro.
    // A função 'get' do lodash é perfeita para checar caminhos aninhados com segurança (ex: 'shippingAddress.street')
    const hasErrorsInStep = fieldsToValidate
      ? fieldsToValidate.some(field => get(errors, field))
      : false;

    // 4. A decisão de avançar agora é baseada na nossa verificação, não no retorno do trigger.
    if (!hasErrorsInStep) {
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
        toast.success(response.message);
        if (resetOnClose) methods.reset();
        if (steps.length > 0) setCurrentStep(0);
        setOpen(false);
      } else {
        // Mostra o erro retornado pelo servidor
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro inesperado ao finalizar.");
    }
  });

  const toggleSheet = (open: boolean) => {
    setOpen(open);
    if (onOpenChange) onOpenChange(open);
    if (!open && resetOnClose) {
      methods.reset();
      setCurrentStep(0);
    }
  };

  const isSubmitting = methods.formState.isSubmitting;

  return (
    <Sheet open={open} onOpenChange={toggleSheet}>
      <SheetTrigger asChild>{customTrigger}</SheetTrigger>
      <SheetContent
        side={side}
        className={className || "sm:max-w-[600px] w-full"}
      >
        <SheetHeader className="pb-4">
          <SheetTitle>{sheetTitle}</SheetTitle>
          <SheetDescription>{sheetDescription}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 w-full overflow-y-auto max-h-[calc(100vh-8rem)]">
          {steps.length > 0 && (
            <StepProgressBar currentStep={currentStep} steps={steps} />
          )}
          <FormProvider {...methods}>
            {/* Usamos um 'form' aqui para que o handleSubmit funcione com o botão final */}
            <form
              onSubmit={handleSubmitForm}
              className="flex flex-col h-full justify-between"
            >
              <div className="gap-6 py-6 px-1">
                {React.Children.toArray(children)[currentStep]}
              </div>

              {/* Navegação dos Passos */}
              <div className="flex sm:flex-row flex-col-reverse justify-between gap-4 mt-auto pt-4 border-t">
                {currentStep > 0 && (
                  <Button
                    onClick={goToPreviousStep}
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isSubmitting}
                  >
                    Voltar
                  </Button>
                )}
                {steps.length > 0 && currentStep < steps.length - 1 && (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full disabled:opacity-50"
                    // MUDANÇA: A condição 'disabled' agora também verifica a nova propriedade
                    disabled={
                      methods.formState.isSubmitting ||
                      steps[currentStep]?.isStepDisabled
                    }
                  >
                    Próximo
                  </Button>
                )}
                {currentStep === steps.length - 1 && (
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" /> Finalizando...
                      </>
                    ) : (
                      buttonTitle
                    )}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </SheetContent>
    </Sheet>
  );
}

