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
    <div
      id="assessment-container"
      className="fixed inset-0 z-40 flex flex-col bg-[#0B1110] text-[#F2EFE6]"
      style={{ height: '100dvh' }}
    >
      {/* El aura de la dimension que se esta midiendo. Cambia con la pregunta,
          asi que el fondo acompana en vez de ser un telon fijo. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-52 left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full blur-3xl transition-colors duration-700"
          style={{ backgroundColor: `${dimensionInfo.color}1A` }}
        />
      </div>

      {/* Barra superior fija */}
      <div className="relative z-10 shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 border-b border-[#141E1B] bg-[#0B1110]/80 backdrop-blur">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs text-[#9DA79F] hover:text-[#F2EFE6] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
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
            <span className="hidden sm:inline">Rápido </span>24
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
            <span className="hidden sm:inline">Completo </span>60
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

      {/* El progreso, en una linea fina bajo la barra */}
      <div className="relative z-10 shrink-0 h-1 bg-[#121A17]">
        <div
          className="h-full bg-gradient-to-r from-[#315C45] to-[#D6A84F] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* El cuerpo: la afirmacion manda, y ocupa lo que haga falta */}
      <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain flex flex-col">
        <div
          id={`question-card-${currentQuestion.id}`}
          className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-6 my-auto space-y-8"
        >
        {/* Dimension & Category pill */}
        <div className="flex items-center justify-center">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111A17] border text-xs text-[#C5CFC7] transition-colors"
            style={{ borderColor: `${dimensionInfo.color}55` }}
          >
            <DimensionIcon dim={currentQuestion.dimensionFocus} />
            <span className="capitalize">{dimensionInfo.name}</span>
            {currentQuestion.scenarioCategory && (
              <>
                <span className="text-[#6B7A72]">·</span>
                <span className="text-[#9DA79F]">{currentQuestion.scenarioCategory}</span>
              </>
            )}
          </div>
        </div>

        {/* La afirmacion. Sin caja alrededor: en una pantalla que solo tiene
            esto, un marco no aporta nada y le quita presencia. */}
        <div className="py-2 sm:py-4">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-semibold text-[#F2EFE6] leading-snug text-center">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Likert Scale Options (1 to 5) */}
        <div className="space-y-2.5">
          <p className="text-[11px] text-[#9DA79F] uppercase tracking-wider font-medium text-center mb-3">
            ¿Cuánto se parece a ti?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {LIKERT_OPTIONS.map(opt => {
              const isSelected = currentAnswerValue === opt.value;
              return (
                <button
                  key={opt.value}
                  id={`likert-btn-${opt.value}`}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`p-3.5 sm:p-3 rounded-xl border transition-all flex sm:flex-col items-center justify-start sm:justify-center text-left sm:text-center gap-3 sm:gap-1 min-h-[52px] sm:min-h-0 active:scale-98 ${
                    isSelected
                      ? 'bg-[#315C45] border-[#D6A84F] text-[#F2EFE6] font-semibold shadow-md ring-1 ring-[#D6A84F]'
                      : 'bg-[#16201D] border-[#1E2A25] text-[#C5CFC7] hover:border-[#315C45] hover:bg-[#1A2521]'
                  }`}
                >
                  <span className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-mono font-bold bg-[#0B1110]/60 border border-[#23332D]">
                    {opt.value}
                  </span>
                  <span className="text-sm sm:text-xs leading-tight sm:mt-1">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        </div>
      </div>

      {/* Pie fijo: siempre alcanzable, tambien en pantallas cortas */}
      <div
        className="relative z-10 shrink-0 border-t border-[#141E1B] bg-[#0B1110]/90 backdrop-blur px-4 sm:px-6 py-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
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
        <p className="hidden sm:block text-[11px] text-[#4E5C55] text-center pt-2">
          Pulsa las teclas 1 a 5 para responder, y las flechas para moverte
        </p>
      </div>
    </div>
  );
};
