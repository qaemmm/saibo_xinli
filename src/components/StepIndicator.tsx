import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number; // 1 或 2
  totalSteps?: number;
}

export default function StepIndicator({ currentStep, totalSteps = 2 }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          {/* 步骤圆圈 */}
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                transition-all duration-300
                ${
                  step < currentStep
                    ? 'bg-primary text-primary-foreground' // 已完成
                    : step === currentStep
                    ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' // 当前步骤
                    : 'bg-muted text-muted-foreground' // 未开始
                }
              `}
            >
              {step < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step
              )}
            </div>
            <div
              className={`
                mt-2 text-xs font-medium
                ${
                  step <= currentStep
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                }
              `}
            >
              {step === 1 ? '八字排盘' : 'AI分析'}
            </div>
          </div>

          {/* 连接线 */}
          {index < steps.length - 1 && (
            <div
              className={`
                w-16 h-0.5 mx-2 transition-all duration-300
                ${
                  step < currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}

