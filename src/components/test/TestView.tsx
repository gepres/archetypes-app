import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Brain,
  Zap,
  Heart,
  Hammer,
} from 'lucide-react';
import { DIMENSIONS } from '../../data/archetypesData';
import {
  LIKERT_OPTIONS,
  QUESTIONS_DATA,
  QUICK_QUESTION_IDS,
} from '../../data/questionsData';
import { calculateAssessmentResult } from '../../services/scoringEngine';
import { StorageService } from '../../services/storageService';
import { AssessmentAnswer, AssessmentResult, DimensionId } from '../../types';

interface TestViewProps {
  testType: 'full' | 'quick';
  onComplete: (result: AssessmentResult) => void;
  onCancel: () => void;
}

export const TestView: React.FC<TestViewProps> = ({
  testType: initialTestType,
  onComplete,
  onCancel,
}) => {
  const [testType, setTestType] = useState<'full' | 'quick'>(initialTestType);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Get active questions based on test type
  const questions = testType === 'quick'
    ? QUESTIONS_DATA.filter(q => QUICK_QUESTION_IDS.includes(q.id))
    : QUESTIONS_DATA;

  // Restore saved progress if any
  useEffect(() => {
    const saved = StorageService.getTestProgress();
    if (saved && saved.testType === testType && Object.keys(saved.answers).length > 0) {
      setAnswers(saved.answers);
      setCurrentIndex(Math.min(saved.currentIndex, questions.length - 1));
    }
  }, [testType]);

  // Save progress on change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      StorageService.saveTestProgress({
        answers,
        currentIndex,
        testType,
      });
    }
  }, [answers, currentIndex, testType]);

  const currentQuestion = questions[currentIndex] || questions[0];
  const currentAnswerValue = answers[currentQuestion.id];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const answeredCount = Object.keys(answers).length;
  const isFinished = answeredCount === questions.length;

  const handleSelectOption = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));

    // Auto advance after slight delay for smooth visual feedback
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 220);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFinish = () => {
    setIsCalculating(true);

    setTimeout(() => {
      // Build answer list
      const answerList: AssessmentAnswer[] = questions.map(q => ({
        questionId: q.id,
        value: answers[q.id] || 3, // default neutral if somehow unselected
      }));

      const userProfile = StorageService.getUserProfile();
      const result = calculateAssessmentResult(answerList, testType, userProfile.gender || 'male');
      StorageService.saveCurrentResult(result);
      StorageService.clearTestProgress();
      setIsCalculating(false);
      onComplete(result);
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm("¿Deseas reiniciar tus respuestas a este cuestionario?")) {
      setAnswers({});
      setCurrentIndex(0);
      StorageService.clearTestProgress();
    }
  };

  // Keyboard navigation support (1-5 and Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        handleSelectOption(parseInt(e.key, 10));
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length]);

  const dimensionInfo = DIMENSIONS[currentQuestion.dimensionFocus];

  const DimensionIcon = ({ dim }: { dim: DimensionId }) => {
    switch (dim) {
      case 'mente':
        return <Brain className="w-3.5 h-3.5 text-[#3B82F6]" />;
      case 'accion':
        return <Zap className="w-3.5 h-3.5 text-[#EF4444]" />;
      case 'corazon':
        return <Heart className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'construccion':
        return <Hammer className="w-3.5 h-3.5 text-[#D6A84F]" />;
    }
  };

  if (isCalculating) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto p-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-[#1E2A25] border-t-[#D6A84F] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-[#D6A84F]" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-[#F2EFE6]">
            Sintetizando tu Mapa Arquetípico...
          </h2>
          <p className="text-xs text-[#9DA79F] leading-relaxed">
            Calculando balance dimensional, correlaciones de arquetipos dominantes y áreas de desarrollo consciente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="assessment-container" className="max-w-2xl mx-auto space-y-8 pb-16 pt-2">
      {/* Test Mode Selector / Header Controls */}
      <div className="flex items-center justify-between border-b border-[#1E2A25] pb-4">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-[#9DA79F] hover:text-[#F2EFE6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver</span>
        </button>

        <div className="inline-flex rounded-lg bg-[#121A17] p-1 border border-[#1E2A25] text-xs">
          <button
            onClick={() => {
              if (testType !== 'quick') {
                setTestType('quick');
                setCurrentIndex(0);
              }
            }}
            className={`px-3 py-1 rounded-md transition-all ${
              testType === 'quick'
                ? 'bg-[#315C45] text-[#F2EFE6] font-semibold'
                : 'text-[#9DA79F] hover:text-[#F2EFE6]'
            }`}
          >
            Rápido (24)
          </button>
          <button
            onClick={() => {
              if (testType !== 'full') {
                setTestType('full');
                setCurrentIndex(0);
              }
            }}
            className={`px-3 py-1 rounded-md transition-all ${
              testType === 'full'
                ? 'bg-[#315C45] text-[#F2EFE6] font-semibold'
                : 'text-[#9DA79F] hover:text-[#F2EFE6]'
            }`}
          >
            Completo (60)
          </button>
        </div>

        <button
          onClick={handleReset}
          title="Reiniciar respuestas"
          className="text-xs text-[#6B7A72] hover:text-[#EF4444] transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reiniciar</span>
        </button>
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#F2EFE6]">
              Pregunta {currentIndex + 1} de {questions.length}
            </span>
            <span className="text-[#6B7A72]">·</span>
            <span className="text-[#9DA79F]">
              {answeredCount} respondidas
            </span>
          </div>
          <span className="font-mono text-[#D6A84F] font-bold">{progressPercent}%</span>
        </div>

        {/* Bar */}
        <div className="h-1.5 w-full bg-[#121A17] rounded-full overflow-hidden border border-[#1E2A25]">
          <div
            className="h-full bg-gradient-to-r from-[#315C45] to-[#D6A84F] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div
        id={`question-card-${currentQuestion.id}`}
        className="p-6 sm:p-8 rounded-2xl bg-[#121A17] border border-[#23332D] shadow-xl space-y-8 min-h-[380px] flex flex-col justify-between transition-all"
      >
        {/* Dimension & Category pill */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A2521] border border-[#23332D] text-xs text-[#C5CFC7]">
            <DimensionIcon dim={currentQuestion.dimensionFocus} />
            <span className="capitalize">{dimensionInfo.name}</span>
            {currentQuestion.scenarioCategory && (
              <>
                <span className="text-[#6B7A72]">·</span>
                <span className="text-[#9DA79F]">{currentQuestion.scenarioCategory}</span>
              </>
            )}
          </div>
          <span className="text-[11px] text-[#6B7A72] font-mono">
            #{currentQuestion.id}
          </span>
        </div>

        {/* Question Statement */}
        <div className="py-2">
          <h2 className="font-serif text-xl sm:text-2xl md:text-[26px] font-semibold text-[#F2EFE6] leading-snug">
            "{currentQuestion.text}"
          </h2>
        </div>

        {/* Likert Scale Options (1 to 5) */}
        <div className="space-y-2.5">
          <p className="text-[11px] text-[#9DA79F] uppercase tracking-wider font-medium text-center mb-3">
            Selecciona el grado de afinidad con tu forma de ser:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {LIKERT_OPTIONS.map(opt => {
              const isSelected = currentAnswerValue === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`likert-btn-${opt.value}`}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`p-3 rounded-xl border text-center transition-all flex sm:flex-col items-center sm:justify-center justify-between gap-1 active:scale-98 ${
                    isSelected
                      ? 'bg-[#315C45] border-[#D6A84F] text-[#F2EFE6] font-semibold shadow-md ring-1 ring-[#D6A84F]'
                      : 'bg-[#16201D] border-[#1E2A25] text-[#C5CFC7] hover:border-[#315C45] hover:bg-[#1A2521]'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-[#0B1110]/60 border border-[#23332D]">
                    {opt.value}
                  </span>
                  <span className="text-xs leading-tight sm:mt-1">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
            currentIndex === 0
              ? 'border-[#1E2A25] text-[#4A5550] cursor-not-allowed bg-transparent'
              : 'border-[#23332D] bg-[#121A17] text-[#C5CFC7] hover:bg-[#1A2521]'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-2">
          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1A2521] hover:bg-[#23332D] border border-[#23332D] text-xs font-medium text-[#F2EFE6] transition-all"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="finish-assessment-btn"
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#D6A84F] hover:bg-[#E5BE72] text-[#0B1110] text-xs font-bold transition-all shadow-lg active:scale-95 animate-pulse"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Generar Mi Mapa</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtle Hint */}
      <p className="text-[11px] text-[#6B7A72] text-center pt-2">
        Consejo: Puedes presionar los números del 1 al 5 en tu teclado para responder rápidamente.
      </p>
    </div>
  );
};
