import { cn } from "@/lib/utils";

const STEP_COUNT = 4;

/** Bar width plus the height ramp that turns the bars into a staircase. */
const SIZES = {
  sm: { bar: "w-1.5", base: 5, rise: 4 },
  lg: { bar: "w-3", base: 10, rise: 9 },
} as const;

interface Props {
  size?: keyof typeof SIZES;
  className?: string;
  /** Screen-reader text. Omit when visible text already describes the wait. */
  label?: string;
}

/**
 * Loading indicator: four rising steps that light up in sequence, echoing the
 * product's climb-one-step-at-a-time metaphor instead of a generic spinner.
 *
 * Bars inherit the current text colour, so callers tint it with `text-*`.
 */
export default function StairsLoader({ size = "sm", className, label }: Props) {
  const { bar, base, rise } = SIZES[size];

  return (
    <div
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      // Forced LTR so the staircase always ascends rightward: inside the app's
      // RTL containers a flex row would otherwise mirror it into a descent.
      dir="ltr"
      className={cn("flex shrink-0 items-end gap-px", className)}
    >
      {Array.from({ length: STEP_COUNT }, (_, i) => (
        <span
          key={i}
          className={cn(
            bar,
            "rounded-[1px] bg-current animate-step-climb motion-reduce:animate-none motion-reduce:opacity-60",
          )}
          style={{
            height: `${base + i * rise}px`,
            animationDelay: `${i * 140}ms`,
          }}
        />
      ))}
    </div>
  );
}
