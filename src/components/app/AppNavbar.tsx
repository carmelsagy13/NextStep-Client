import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, Map, LogOut, BookOpen, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { userProfile: user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const navLinks = [
    { href: "/roadmap", label: "המפה שלי", icon: Map },
    { href: "/data-center", label: "מרכז הידע", icon: BookOpen },
    { href: "/profile", label: "הפרופיל שלי", icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const logoHref = isAuthenticated ? "/roadmap" : "/";

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="relative px-6 h-14 flex items-center justify-between">
        {/* Left: Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
          aria-label={theme === "dark" ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Center: Logo */}
        <Link to={logoHref} className="absolute left-1/2 -translate-x-1/2">
          <img src="/IconNoText.png" alt="NextStep" className="h-8" />
        </Link>

        {/* Right: hamburger — always visible */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
          aria-label={isOpen ? "סגירת התפריט" : "פתיחת התפריט"}
          aria-expanded={isOpen}
          aria-controls="app-nav-menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-14 z-40 bg-foreground/20"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu panel */}
          <div
            id="app-nav-menu"
            className="absolute top-14 left-0 right-0 z-50 max-h-[calc(100vh-3.5rem)] overflow-y-auto bg-background border-b border-border shadow-xl"
            dir="rtl"
          >
            {/* User info */}
            {user && (user.name || user.email) && (
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user.name?.charAt(0) ||
                        user.email?.charAt(0)?.toUpperCase() ||
                        "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {user.name && (
                      <p className="font-medium text-sm truncate">
                        {user.name}
                      </p>
                    )}
                    {user.email && (
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isAuthenticated ? (
              <>
                {/* Nav links */}
                <div className="py-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 transition-colors
                        ${
                          isActive(link.href)
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        }
                      `}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">התנתקות</span>
                  </button>
                </div>
              </>
            ) : (
              /* Not logged in → Log In / Get Started */
              <div className="py-2">
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted transition-colors"
                >
                  <span className="font-medium">התחברות</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-primary hover:bg-muted transition-colors"
                >
                  <span className="font-medium">הרשמה</span>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </nav>
  );
};

export default AppNavbar;
