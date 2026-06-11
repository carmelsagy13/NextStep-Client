import AppNavbar from "@/components/app/AppNavbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import RoadmapPreview from "@/components/landing/RoadmapPreview";
import DashboardPreview from "@/components/landing/DashboardPreview";
import KnowledgeHubPreview from "@/components/landing/KnowledgeHubPreview";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <main>
        <HeroSection />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="roadmap">
          <RoadmapPreview />
        </section>
        <DashboardPreview />
        <section id="knowledge">
          <KnowledgeHubPreview />
        </section>
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
