import { Button } from "@/components/ui/button";
import { Clock, Lock, Zap } from "lucide-react";
import heroImage from "@assets/generated_images/Encrypted_time_tunnel_hero_08830dc6.png";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <section className="relative min-h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>
      
      <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-primary">
            <Lock className="h-3 w-3" />
            Encrypted Time Capsules
          </div>
          
          <h1 className="mb-6 font-serif text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl">
            Send Messages
            <br />
            <span className="text-primary">Through Time</span>
          </h1>
          
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
            Create encrypted digital time capsules with text, photos, or voice. 
            Schedule them to arrive at your future self—3 months, 1 year, or 5 years from now.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={onGetStarted}
              data-testid="button-get-started"
              className="glow-primary"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              data-testid="button-learn-more"
              className="bg-background/50 backdrop-blur"
            >
              Learn More
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Encrypted</h3>
                <p className="text-sm text-muted-foreground">End-to-end secure</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Scheduled</h3>
                <p className="text-sm text-muted-foreground">Up to 5 years ahead</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-foreground">Instant</h3>
                <p className="text-sm text-muted-foreground">Lightning fast delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
