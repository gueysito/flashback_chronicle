import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PricingSectionProps {
  onSelectPlan?: (plan: string) => void;
}

export default function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Get started with basic time capsules',
      features: [
        'Up to 3 capsules',
        'Text messages only',
        '6 month maximum delivery',
        'Email delivery',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      id: '3year',
      name: '3 Year Plan',
      price: '$39',
      period: 'one-time',
      description: 'Perfect for medium-term goals',
      features: [
        'Unlimited capsules',
        'Text, photo & voice',
        'Up to 3 years delivery',
        'Priority email delivery',
        'AI prompt suggestions',
        'Push notifications',
      ],
      cta: 'Choose Plan',
      popular: true,
    },
    {
      id: '5year',
      name: '5 Year Plan',
      price: '$79',
      period: 'one-time',
      description: 'For long-term vision keepers',
      features: [
        'Everything in 3 Year',
        'Up to 5 years delivery',
        'Advanced encryption',
        'Friend delivery option',
        'Priority support',
        'Capsule editing',
      ],
      cta: 'Choose Plan',
      popular: false,
    },
  ];

  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-primary">
            <Lock className="h-3 w-3" />
            Simple Pricing
          </div>
          <h2 className="mb-4 font-serif text-4xl font-bold text-foreground md:text-5xl">
            Choose Your Journey
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            One-time payment. No subscriptions. Own your time capsules forever.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden hover-elevate transition-all ${
                plan.popular ? 'border-primary/50 shadow-lg' : ''
              }`}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  POPULAR
                </div>
              )}
              
              <div className="p-8">
                <h3 className="mb-2 font-serif text-2xl font-bold text-foreground">
                  {plan.name}
                </h3>
                <p className="mb-6 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  </div>
                </div>

                <Button
                  className={`mb-8 w-full ${plan.popular ? 'glow-primary' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => onSelectPlan?.(plan.id)}
                  data-testid={`button-select-${plan.id}`}
                >
                  {plan.cta}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
