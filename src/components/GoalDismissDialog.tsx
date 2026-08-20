import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  DISMISSAL_REASON_LABEL,
  DISMISSAL_REASON_ORDER,
} from "@/lib/goalDismissal";
import { GoalDismissalReason } from "@/types";

const NOTE_MAX_LENGTH = 280;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalName: string;
  /** Rejects to keep the dialog open and surface an error. */
  onConfirm: (reason: GoalDismissalReason, note?: string) => Promise<void>;
}

/**
 * Collects WHY a task did not fit the user. The reason is fed back into the
 * goal-selection prompts, so it is worth asking for rather than dismissing
 * silently.
 */
export default function GoalDismissDialog({
  open,
  onOpenChange,
  goalName,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState<GoalDismissalReason | "">("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Clearing on close (rather than on open) keeps the next open pristine
  // without a state-resetting effect.
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason("");
      setNote("");
      setError("");
    }
    onOpenChange(next);
  };

  const handleConfirm = async () => {
    if (!reason || submitting) return;
    setError("");
    setSubmitting(true);
    try {
      await onConfirm(
        reason,
        reason === GoalDismissalReason.OTHER ? note.trim() : undefined,
      );
      handleOpenChange(false);
    } catch {
      setError("לא הצלחנו לשמור את המשוב — נסו שוב");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* The shared DialogContent hard-codes the close button to the right; move it. */}
      <DialogContent
        dir="rtl"
        className="max-w-md [&>button]:left-4 [&>button]:right-auto"
      >
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="pl-6 text-base leading-relaxed">
            נשמח להבין למה סימנת את המשימה כלא רלוונטית, כדי להציג משימות
            יותר מתאימות בהמשך
          </DialogTitle>
          <DialogDescription className="pt-1">
            <span className="font-medium text-foreground">המשימה: </span>
            {goalName}
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          dir="rtl"
          value={reason}
          onValueChange={(v) => setReason(v as GoalDismissalReason)}
          className="grid gap-2"
        >
          {DISMISSAL_REASON_ORDER.map((value) => (
            <label
              key={value}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-all ${
                reason === value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={value} />
              <span>{DISMISSAL_REASON_LABEL[value]}</span>
            </label>
          ))}
        </RadioGroup>

        {reason === GoalDismissalReason.OTHER && (
          <Textarea
            autoFocus
            dir="rtl"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={NOTE_MAX_LENGTH}
            rows={3}
            placeholder="נשמח לשמוע יותר"
            aria-label="סיבה חופשית"
            className="text-right"
          />
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

        <DialogFooter className="gap-2 sm:justify-start sm:space-x-0">
          <Button onClick={handleConfirm} disabled={!reason || submitting}>
            {submitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            שליחה
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
