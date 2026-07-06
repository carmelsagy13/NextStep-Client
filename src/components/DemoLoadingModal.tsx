import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AnalysisLoadingIndicator from "./AnalysisLoadingIndicator";

interface Props {
  /** Controls modal visibility. */
  open: boolean;
  /** Optional error message to surface if the demo analysis failed. */
  errorMsg?: string;
}

/**
 * Demo Mode loading modal.
 *
 * Wraps the shared {@link AnalysisLoadingIndicator} (phases + progress + tips)
 * inside a prominent, non-dismissable overlay while the LLM roadmap generation
 * runs. The overlay stays until the caller flips `open` to false (i.e. when the
 * backend responds), at which point the fresh tasks render on the roadmap.
 */
export default function DemoLoadingModal({ open, errorMsg }: Props) {
  return (
    <Dialog open={open}>
      <DialogContent
        dir="rtl"
        // Keep the modal locked open during generation — block outside click,
        // escape key and the close button so the demo flow isn't interrupted.
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="max-w-md [&>button]:hidden"
      >
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            בונים את המפה הפיננסית שלך
          </DialogTitle>
          <DialogDescription>
            הבינה המלאכותית מנתחת את הנתונים שלך ומרכיבה תוכנית אישית. זה ייקח רק
            כמה רגעים.
          </DialogDescription>
        </DialogHeader>

        <AnalysisLoadingIndicator active={open} />

        {errorMsg && (
          <p className="text-sm text-destructive" role="alert">
            {errorMsg}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
