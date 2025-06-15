import { Progress } from "@/components/ui/progress";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export interface Step {
  id: number;
  name: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
}

interface StepProgressBarProps {
  currentStep: number;
  steps: Step[];
}

export function StepProgressBar({ currentStep, steps }: StepProgressBarProps) {
  const widthPerStep = (currentStep / steps.length) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-flow-col">
        {steps.map((step, index) => (
          <div
            key={index}
            className="w-full justify-center gap-2 flex items-center"
          >
            <div
              className={`flex items-center justify-center p-3 sm:p-2.5 rounded-full border-2 border-input ${
                currentStep === step.id
                  ? "text-white bg-primary"
                  : "text-primary bg-input"
              }`}
            >
              <step.icon className="h-5 w-5" />
            </div>
            <span className="max-sm:hidden">{step.name}</span>
          </div>
        ))}
      </div>
      <Progress className="bg-input h-3" value={widthPerStep} />
    </div>
  );
}
