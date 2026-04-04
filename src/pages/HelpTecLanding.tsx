import ParticlesBackground from "@/components/helptec/ParticlesBackground";
import Navbar from "@/components/helptec/Navbar";
import HeroSection from "@/components/helptec/HeroSection";
import ServicesSection from "@/components/helptec/ServicesSection";
import DifferentialsSection from "@/components/helptec/DifferentialsSection";
import ProjectsSection from "@/components/helptec/ProjectsSection";
import HowItWorksSection from "@/components/helptec/HowItWorksSection";
import AISection from "@/components/helptec/AISection";
import TestimonialsSection from "@/components/helptec/TestimonialsSection";
import PlansSection from "@/components/helptec/PlansSection";
import FAQSection from "@/components/helptec/FAQSection";
import ContactFormSection from "@/components/helptec/ContactFormSection";
import CTASection from "@/components/helptec/CTASection";
import Footer from "@/components/helptec/Footer";
import WhatsAppButton from "@/components/helptec/WhatsAppButton";

const HelpTecLanding = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <ParticlesBackground />
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <DifferentialsSection />
      <ProjectsSection />
      <HowItWorksSection />
      <AISection />
      <TestimonialsSection />
      <PlansSection />
      <FAQSection />
      <ContactFormSection />
      <CTASection />
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default HelpTecLanding;
