import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  const handleSelectPlan = (plan: string) => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen">
      <Header
        onMenuClick={() => console.log('Menu clicked')}
        onNewCapsule={handleGetStarted}
      />
      
      <HeroSection onGetStarted={handleGetStarted} />
      
      <PricingSection onSelectPlan={handleSelectPlan} />
    </div>
  );
}
