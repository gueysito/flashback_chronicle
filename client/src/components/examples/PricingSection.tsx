import PricingSection from '../PricingSection';

export default function PricingSectionExample() {
  return <PricingSection onSelectPlan={(plan) => console.log('Selected plan:', plan)} />;
}
