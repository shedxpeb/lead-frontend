'use client';

import { useState, useCallback, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  validate?: () => boolean | { valid: boolean; errors?: Record<string, string> };
}

interface FormWizardProps {
  steps: WizardStep[];
  onSubmit: () => void | Promise<void>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  submitButtonText?: string;
  showReviewStep?: boolean;
  reviewContent?: ReactNode;
  className?: string;
}

export function FormWizard({
  steps,
  onSubmit,
  isSubmitting = false,
  onCancel,
  submitButtonText = 'Submit',
  showReviewStep = false,
  reviewContent,
  className,
}: FormWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<number, Record<string, string>>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const totalSteps = showReviewStep ? steps.length + 1 : steps.length;
  const isLastStep = currentStep === steps.length - 1;
  const isReviewStep = showReviewStep && currentStep === steps.length;

  const validateCurrentStep = useCallback(() => {
    const step = steps[currentStep];
    if (!step.validate) return true;

    const result = step.validate();
    
    if (typeof result === 'boolean') {
      if (!result) {
        setStepErrors((prev) => ({
          ...prev,
          [currentStep]: { _form: 'Please fix the errors before proceeding' },
        }));
        return false;
      }
      return true;
    }

    if (!result.valid) {
      setStepErrors((prev) => ({
        ...prev,
        [currentStep]: result.errors || { _form: 'Please fix the errors before proceeding' },
      }));
      return false;
    }

    // Clear errors for this step
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[currentStep];
      return next;
    });
    return true;
  }, [currentStep, steps]);

  const handleNext = useCallback(async () => {
    if (!validateCurrentStep()) return;

    if (isLastStep) {
      if (showReviewStep) {
        setCurrentStep((prev) => prev + 1);
      } else {
        await onSubmit();
      }
    } else {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, isLastStep, validateCurrentStep, onSubmit, showReviewStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (stepIndex <= currentStep || completedSteps.has(stepIndex)) {
        setCurrentStep(stepIndex);
      }
    },
    [currentStep, completedSteps]
  );

  const handleSubmit = useCallback(async () => {
    try {
      await onSubmit();
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }, [onSubmit]);

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Stepper */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(index)}
                disabled={index > currentStep && !completedSteps.has(index)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index < currentStep || completedSteps.has(index)
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs">
                  {index < currentStep || completedSteps.has(index) ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            ))}
            {showReviewStep && (
              <button
                type="button"
                onClick={() => handleStepClick(steps.length)}
                disabled={!isLastStep && !completedSteps.has(steps.length - 1)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  isReviewStep
                    ? 'bg-primary text-primary-foreground'
                    : isLastStep || completedSteps.has(steps.length - 1)
                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full text-xs">
                  {isReviewStep ? <Check className="w-3 h-3" /> : totalSteps}
                </span>
                <span className="hidden sm:inline">Review</span>
              </button>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              {isReviewStep ? 'Review & Submit' : steps[currentStep].title}
            </h3>
            {steps[currentStep].description && !isReviewStep && (
              <p className="text-sm text-muted-foreground mt-1">
                {steps[currentStep].description}
              </p>
            )}
          </div>

          {/* Step Errors */}
          {stepErrors[currentStep] && Object.keys(stepErrors[currentStep]).length > 0 && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              {Object.entries(stepErrors[currentStep]).map(([field, error]) => (
                <p key={field} className="text-sm text-destructive">
                  {field === '_form' ? error : `${field}: ${error}`}
                </p>
              ))}
            </div>
          )}

          {isReviewStep && reviewContent ? (
            reviewContent
          ) : (
            <div className="min-h-[300px]">{steps[currentStep].content}</div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
        </div>

        <Button
          type="button"
          onClick={isReviewStep ? handleSubmit : handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            'Submitting...'
          ) : isReviewStep ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              {submitButtonText}
            </>
          ) : isLastStep && !showReviewStep ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              {submitButtonText}
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
