import { useParams, Link } from "react-router-dom";
import AppNavbar from "@/components/app/AppNavbar";
import { getArticlesByCategory, getCategoryById } from "@/data/articles";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

const Category = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getCategoryById(categoryId || "");
  const articles = getArticlesByCategory(categoryId || "");

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex flex-col" dir="rtl">
        <AppNavbar />
        <main className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">הקטגוריה לא נמצאה</h1>
            <Link to="/data-center" className="text-primary hover:underline">
              חזרה למרכז הידע
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <AppNavbar />

      <main className="flex-1 px-6 py-4">
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link
            to="/data-center"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            מרכז הידע
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold mb-2">
              {category.title}
            </h1>
            <p className="text-muted-foreground">{category.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {articles.length} מאמרים
            </p>
          </div>

          {/* Articles list */}
          <div className="space-y-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="glass-card p-4 block group hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {article.readTime} דק׳ קריאה
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {articles.length === 0 && (
            <div className="glass-card p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                אין עדיין מאמרים בקטגוריה זו.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Category;
