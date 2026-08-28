import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";
import type { Lang, Question } from "@/types/questionnaire";
import {
  byOrderIndex,
  formatDateISO,
  isMoneyQuestion,
  localize,
  parseDateISO,
} from "@/lib/questionnaireEngine";
import { formatThousands, parseThousands, cn } from "@/lib/utils";
import type { QuestionnaireEngine } from "@/hooks/useQuestionnaireEngine";

interface DynamicFieldProps {
  question: Question;
  engine: QuestionnaireEngine;
  lang: Lang;
}

interface DatePickerFieldProps {
  value: Date | null;
  onChange: (date: Date | undefined) => void;
  locale: Locale;
  lang: Lang;
  dir: "rtl" | "ltr";
  invalid: boolean;
}

/** Date button + calendar popover that dismisses itself once a day is picked. */
function DatePickerField({
  value,
  onChange,
  locale,
  lang,
  dir,
  invalid,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          dir={dir}
          aria-invalid={invalid}
          className={cn(
            "w-full justify-start gap-2 font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {value
            ? format(value, "PPP", { locale })
            : lang === "he"
              ? "בחר תאריך"
              : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={locale}
          captionLayout="dropdown-buttons"
          fromYear={1920}
          toYear={new Date().getFullYear() + 50}
          selected={value ?? undefined}
          defaultMonth={value ?? undefined}
          onSelect={(date) => {
            onChange(date);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Renders a single question by `type`, then recursively renders any visible
 * nested `children`. Visibility, value, and errors are owned by the engine.
 */
export function DynamicField({ question, engine, lang }: DynamicFieldProps) {
  const { getAnswer, getError, setAnswer, isVisible } = engine;

  const key = question.questionKey;
  const value = getAnswer(key);
  const error = getError(key);
  const label = localize(question.text, lang);
  const dir = lang === "he" ? "rtl" : "ltr";

  const sortedOptions = [...(question.options ?? [])].sort(byOrderIndex);

  const visibleChildren = [...(question.children ?? [])]
    .sort(byOrderIndex)
    .filter((child) => isVisible(child.questionKey));

  const renderControl = () => {
    switch (question.type) {
      case "SINGLE_CHOICE":
        return (
          <RadioGroup
            dir={dir}
            value={(value as string) ?? ""}
            onValueChange={(next) => setAnswer(key, next)}
            className="grid gap-2"
          >
            {sortedOptions.map((option) => {
              const selected = value === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value={option.value} />
                  <span>{localize(option.label, lang)}</span>
                </label>
              );
            })}
          </RadioGroup>
        );

      case "MULTIPLE_CHOICE": {
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div dir={dir} className="grid gap-2">
            {sortedOptions.map((option) => {
              const checked = selectedValues.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    checked
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      const next = isChecked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter((v) => v !== option.value);
                      setAnswer(key, next);
                    }}
                  />
                  <span>{localize(option.label, lang)}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case "TEXT":
        return (
          <Input
            dir={dir}
            value={(value as string) ?? ""}
            onChange={(event) => setAnswer(key, event.target.value)}
            aria-invalid={!!error}
          />
        );

      case "NUMBER": {
        // Money fields get thousands-separator formatting and a ₪ prefix.
        if (isMoneyQuestion(question, lang)) {
          const display =
            value === undefined || value === null
              ? ""
              : formatThousands(value as number | string);
          return (
            <div className="relative" dir="ltr">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                ₪
              </span>
              <Input
                type="text"
                inputMode="numeric"
                dir="ltr"
                className="pl-7 text-left"
                value={display}
                onChange={(event) => {
                  const raw = parseThousands(event.target.value);
                  setAnswer(key, raw === "" ? undefined : Number(raw));
                }}
                aria-invalid={!!error}
              />
            </div>
          );
        }
        return (
          <Input
            type="number"
            inputMode="numeric"
            value={value === undefined || value === null ? "" : String(value)}
            onChange={(event) =>
              setAnswer(
                key,
                event.target.value === ""
                  ? undefined
                  : Number(event.target.value),
              )
            }
            aria-invalid={!!error}
          />
        );
      }

      case "DATE": {
        const dateLocale = lang === "he" ? he : enUS;
        return (
          <DatePickerField
            dir={dir}
            lang={lang}
            locale={dateLocale}
            invalid={!!error}
            value={parseDateISO(value as string | undefined)}
            onChange={(date) =>
              setAnswer(key, date ? formatDateISO(date) : undefined)
            }
          />
        );
      }

      case "DURATION": {
        const totalMonths =
          value === undefined || value === null ? undefined : Number(value);
        const years =
          totalMonths === undefined ? "" : Math.floor(totalMonths / 12);
        const months =
          totalMonths === undefined ? "" : totalMonths % 12;

        const commit = (nextYears: number, nextMonths: number) => {
          const total = nextYears * 12 + nextMonths;
          setAnswer(key, Number.isFinite(total) ? total : undefined);
        };

        return (
          <div dir={dir} className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                {lang === "he" ? "שנים" : "Years"}
              </span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className="w-24"
                value={years === "" ? "" : String(years)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "") {
                    setAnswer(
                      key,
                      months === "" || Number(months) === 0
                        ? undefined
                        : Number(months),
                    );
                    return;
                  }
                  commit(
                    Math.max(0, Math.floor(Number(raw))),
                    months === "" ? 0 : Number(months),
                  );
                }}
                aria-invalid={!!error}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">
                {lang === "he" ? "חודשים" : "Months"}
              </span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                className="w-24"
                value={months === "" ? "" : String(months)}
                onChange={(event) => {
                  const raw = event.target.value;
                  if (raw === "") {
                    setAnswer(
                      key,
                      years === "" || Number(years) === 0
                        ? undefined
                        : Number(years) * 12,
                    );
                    return;
                  }
                  commit(
                    years === "" ? 0 : Number(years),
                    Math.max(0, Math.floor(Number(raw))),
                  );
                }}
                aria-invalid={!!error}
              />
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-semibold flex items-center gap-1">
        {label}
        {question.isRequired && <span className="text-destructive">*</span>}
      </Label>

      {renderControl()}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {visibleChildren.length > 0 && (
        <div className="mt-4 ms-2 ps-4 border-s-2 border-primary/20 space-y-6">
          {visibleChildren.map((child) => (
            <DynamicField
              key={child.questionKey}
              question={child}
              engine={engine}
              lang={lang}
            />
          ))}
        </div>
      )}
    </div>
  );
}
