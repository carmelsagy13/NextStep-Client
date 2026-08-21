import { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  MAX_SNOOZE_DAYS,
  SNOOZE_PRESETS,
  addDays,
  formatSnoozeDate,
} from "@/lib/goalSnooze";

const CUSTOM = "custom";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  /** Rejects to keep the dialog open and surface an error. */
  onConfirm: (snoozedUntil: string) => Promise<void>;
}

/**
 * Lets the user park a task until a date they choose instead of rejecting it.
 * The task keeps its place in the roadmap and comes back on its own.
 */
export default function GoalSnoozeDialog({
  open,
  onOpenChange,
  goalName,
  onConfirm,
}: Props) {
  const [choice, setChoice] = useState<string>("");
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resolvedDate =
    choice === CUSTOM ? customDate : choice ? addDays(Number(choice)) : undefined;

  // Clearing on close (rather than on open) keeps the next open pristine
  // without a state-resetting effect.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setChoice("");
      setCustomDate(undefined);
      setError("");
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (!resolvedDate || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(resolvedDate.toISOString());
      handleOpenChange(false);
    } catch {
      setError("לא הצלחנו לדחות את המשימה — נסה שוב");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* The shared DialogContent hard-codes the close button to the right; move it. */}
      <DialogContent
        dir="rtl"
        className="max-h-[90vh] max-w-md overflow-y-auto [&>button]:left-4 [&>button]:right-auto"
      >
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="pl-6 text-base leading-relaxed">
            מתי נזכיר לך את המשימה הזו?
          </DialogTitle>
          <DialogDescription className="pt-1">
            <span className="font-medium text-foreground">המשימה: </span>
            {goalName}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          dir="rtl"
          value={choice}
          onValueChange={setChoice}
          className="grid gap-2"
        >
          {SNOOZE_PRESETS.map((preset) => (
            <label
              key={preset.days}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all ${
                choice === String(preset.days)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={String(preset.days)} />
              <span>{preset.label}</span>
            </label>
          ))}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all ${
              choice === CUSTOM
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value={CUSTOM} />
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span>לתאריך אחר</span>
          </label>
        </RadioGroup>

        {choice === CUSTOM && (
          <div className="flex justify-center">
            {/* fromDate/toDate rather than `disabled`: they also stop the month nav at the bounds. */}
            <Calendar
              mode="single"
              selected={customDate}
              onSelect={setCustomDate}
              fromDate={addDays(1)}
              toDate={addDays(MAX_SNOOZE_DAYS)}
              defaultMonth={customDate ?? addDays(1)}
              className="rounded-xl border"
            />
          </div>
        )}

        {resolvedDate && (
          <p className="text-xs text-muted-foreground">
            המשימה תחזור לרשימה ב־
            {formatSnoozeDate(resolvedDate.toISOString())}
          </p>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <DialogFooter className="gap-2 sm:justify-start sm:space-x-0">
          <Button onClick={handleConfirm} disabled={!resolvedDate || submitting}>
            {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            דחייה למועד הזה
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            ביטול
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
