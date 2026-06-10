import { Link } from "react-router-dom";
import AppNavbar from "@/components/app/AppNavbar";
import {
  BookOpen,
  TrendingUp,
  Shield,
  Landmark,
  Coins,
  GraduationCap,
} from "lucide-react";
import { articles, getArticlesByCategory } from "@/data/articles";

const categories = [
  {
    id: "investing-basics",
    icon: TrendingUp,
    title: "יסודות השקעה",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "emergency-funds",
    icon: Shield,
    title: "קרן חירום",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "pension-retirement",
    icon: Landmark,
    title: "פנסיה ופרישה",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "budgeting-tips",
    icon: Coins,
    title: "טיפים לתקציב",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    id: "financial-literacy",
    icon: GraduationCap,
    title: "אוריינות פיננסית",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    id: "market-insights",
    icon: BookOpen,
    title: "תובנות שוק",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const DataCenter = () => {
  const featuredArticle = articles.find((a) => a.featured);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <main className="flex-1 px-6 py-4">
        <div className="max-w-lg mx-auto" dir="rtl">
          <h1 className="font-display text-2xl font-bold mb-2">מרכז הידע</h1>
          <p className="text-muted-foreground mb-6">
            למד והרחב את הידע הפיננסי שלך
          </p>

          {/* Categories grid */}
          <div className="grid gap-3">
            {categories.map((category) => {
              const articleCount = getArticlesByCategory(category.id).length;
              return (
                <Link
                  key={category.id}
                  to={`/category/${category.id}`}
                  className="glass-card p-4 group cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <category.icon className={`w-6 h-6 ${category.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-0.5">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {articleCount} מאמרים
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Featured article */}
          {featuredArticle && (
            <Link to={`/article/${featuredArticle.id}`} className="block mt-6">
              <div className="glass-card-elevated p-5 group hover:border-primary/30 transition-all">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs mb-3">
                  <GraduationCap className="w-3 h-3" />
                  מומלץ
                </div>
                <h3 className="font-display text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                  {featuredArticle.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {featuredArticle.excerpt}
                </p>
                <span className="text-primary text-sm font-semibold">
                  קרא מאמר →
                </span>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default DataCenter;
