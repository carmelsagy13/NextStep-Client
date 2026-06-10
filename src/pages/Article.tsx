import { useParams, Link } from "react-router-dom";
import AppNavbar from "@/components/app/AppNavbar";
import { getArticleById, getCategoryById } from "@/data/articles";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";

const Article = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const article = getArticleById(articleId || "");
  const category = article ? getCategoryById(article.category) : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppNavbar />
        <main className="flex-1 p-4 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
            <Link to="/data-center" className="text-primary hover:underline">
              Back to Knowledge Hub
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Simple markdown-like rendering
  const renderContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => {
      // Headers
      if (paragraph.startsWith("## ")) {
        return (
          <h2 key={index} className="font-display text-xl font-bold mt-6 mb-3">
            {paragraph.replace("## ", "")}
          </h2>
        );
      }

      // Lists
      if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
        const items = paragraph
          .split("\n")
          .filter((line) => line.startsWith("- ") || line.startsWith("1. "));
        return (
          <ul key={index} className="space-y-2 my-4">
            {items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-muted-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span
                  dangerouslySetInnerHTML={{
                    __html: item
                      .replace(/^[-\d.]\s*/, "")
                      .replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-foreground">$1</strong>',
                      ),
                  }}
                />
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraphs with bold text
      return (
        <p
          key={index}
          className="text-muted-foreground leading-relaxed my-4"
          dangerouslySetInnerHTML={{
            __html: paragraph.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="text-foreground">$1</strong>',
            ),
          }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <main className="flex-1 px-6 py-4">
        <div className="max-w-lg mx-auto">
          {/* Back link */}
          <Link
            to={`/category/${article.category}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {category?.title || "Back"}
          </Link>

          {/* Article header */}
          <article className="glass-card-elevated p-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <span className="px-2 py-1 rounded-full bg-primary/10 text-primary">
                {category?.title}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime} min read
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold mb-4">
              {article.title}
            </h1>

            <p className="text-muted-foreground text-lg mb-6 pb-6 border-b border-border">
              {article.excerpt}
            </p>

            {/* Article content */}
            <div className="prose-sm">{renderContent(article.content)}</div>
          </article>

          {/* Back to category */}
          <div className="mt-6 text-center">
            <Link
              to={`/category/${article.category}`}
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <BookOpen className="w-4 h-4" />
              More articles in {category?.title}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Article;
