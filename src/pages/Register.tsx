import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, CreditCard } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!id.trim() || id.trim().length !== 9) {
      setError("מספר תעודת הזהות חייב להיות בן 9 ספרות.");
      return;
    }
    if (!email.trim()) {
      setError("נדרש כתובת אימייל.");
      return;
    }
    if (!password || password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signup(id.trim(), email.trim(), password);
      if (result.error) {
        setError(result.error);
      } else {
        navigate("/questionnaire");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(168_76%_42%_/_0.06)_0%,_transparent_70%)]" />
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      {/* Header */}
      <header className="relative z-10 p-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>חזרה לדף הבית</span>
        </Link>
      </header>

      {/* Main content */}
      <main
        className="relative z-10 flex-1 flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <img src="/IconNoText.png" alt="NextStep" className="h-12" />
            </div>
            <h1 className="font-display text-3xl font-bold">צור חשבון</h1>
            <p className="text-muted-foreground">
              התחל את המסע שלך לחופש פיננסי
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="glass-card-elevated p-8 space-y-6"
          >
            <div className="space-y-4">
              {/* National ID */}
              <div className="space-y-2">
                <Label htmlFor="id">תעודת זהות</Label>
                <div className="relative">
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="id"
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    value={id}
                    onChange={(e) => setId(e.target.value.replace(/\D/g, ""))}
                    required
                    placeholder="123456789"
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">אימייל</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">סיסמא</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="לפחות 6 תווים"
                    className="pr-10 pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            <div className="min-h-[2.5rem]">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? "יוצר חשבון..." : "צור חשבון"}
            </Button>
          </form>

          {/* Link to login */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            כבר יש לך חשבון?{" "}
            <Link
              to="/auth"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              התחבר
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
