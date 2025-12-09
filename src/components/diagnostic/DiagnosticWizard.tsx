import { useState, useEffect } from "react";
import { DiagnosticData, INITIAL_DIAGNOSTIC_DATA, CalculatedMetrics } from "@/types/diagnostic";
import { calculateMetrics } from "@/utils/diagnosticCalculations";
import { StepIndicator } from "./StepIndicator";
import { Step1Financial } from "./steps/Step1Financial";
import { Step2Benchmark } from "./steps/Step2Benchmark";
import { Step3History } from "./steps/Step3History";
import { Step4Investment } from "./steps/Step4Investment";
import { Step5Validation } from "./steps/Step5Validation";
import { StepResults } from "./steps/StepResults";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Save, RotateCcw } from "lucide-react";

const STEPS = [
  "Financeiro",
  "Benchmark",
  "Histórico",
  "Investimento",
  "Validação",
  "Resultados",
];

interface DiagnosticWizardProps {
  clientId: string;
  onSave: (data: DiagnosticData, metrics: CalculatedMetrics) => void;
  onClose: () => void;
}

export function DiagnosticWizard({ clientId, onSave, onClose }: DiagnosticWizardProps) {
  const storageKey = `diagnostic_${clientId}`;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<DiagnosticData>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : INITIAL_DIAGNOSTIC_DATA;
  });

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setData(INITIAL_DIAGNOSTIC_DATA);
    setCurrentStep(0);
    localStorage.removeItem(storageKey);
  };

  const handleSave = () => {
    const metrics = calculateMetrics(data);
    onSave(data, metrics);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1Financial data={data} onUpdate={setData} />;
      case 1:
        return <Step2Benchmark data={data} onUpdate={setData} />;
      case 2:
        return <Step3History data={data} onUpdate={setData} />;
      case 3:
        return <Step4Investment data={data} onUpdate={setData} />;
      case 4:
        return <Step5Validation data={data} onUpdate={setData} />;
      case 5:
        return <StepResults data={data} />;
      default:
        return null;
    }
  };

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      <StepIndicator steps={STEPS} currentStep={currentStep} />
      
      <div className="flex-1 overflow-y-auto px-1 scrollbar-thin">
        {renderStep()}
      </div>

      <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={currentStep === 0 ? onClose : handlePrevious}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {currentStep === 0 ? 'Cancelar' : 'Anterior'}
          </Button>

          {isLastStep ? (
            <Button 
              onClick={handleSave}
              className="bg-diagnostic-secondary hover:bg-diagnostic-secondary/90 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Objetivos
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="bg-diagnostic-primary hover:bg-diagnostic-primary/90"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
