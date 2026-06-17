import type { Lang, Screen } from "@/types/questionnaire";
import { byOrderIndex, localize } from "@/lib/questionnaireEngine";
import type { QuestionnaireEngine } from "@/hooks/useQuestionnaireEngine";
import { DynamicField } from "./DynamicField";

interface DynamicScreenProps {
  screen: Screen;
  engine: QuestionnaireEngine;
  lang: Lang;
}

/** Renders a single screen: title, subtitle, and its visible root questions. */
export function DynamicScreen({ screen, engine, lang }: DynamicScreenProps) {
  const title = localize(screen.title, lang);
  const subtitle = localize(screen.subtitle, lang);

  const visibleQuestions = [...(screen.questions ?? [])]
    .sort(byOrderIndex)
    .filter((question) => engine.isVisible(question.questionKey));

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {(title || subtitle) && (
        <div className="text-center space-y-2">
          {title && (
            <h2 className="font-display text-2xl font-bold">{title}</h2>
          )}
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
      )}

      <div className="space-y-8">
        {visibleQuestions.map((question) => (
          <DynamicField
            key={question.questionKey}
            question={question}
            engine={engine}
            lang={lang}
          />
        ))}
      </div>
    </div>
  );
}
