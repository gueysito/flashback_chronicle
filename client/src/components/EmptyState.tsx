import { Button } from "@/components/ui/button";
import emptyStateImage from "@assets/generated_images/Empty_state_locked_vault_e6b378a5.png";

interface EmptyStateProps {
  onCreateFirst?: () => void;
}

export default function EmptyState({ onCreateFirst }: EmptyStateProps) {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 w-48 h-48 relative">
        <img
          src={emptyStateImage}
          alt="No capsules yet"
          className="h-full w-full object-contain opacity-80"
        />
      </div>
      
      <h3 className="mb-3 font-serif text-2xl font-bold text-foreground">
        No Time Capsules Yet
      </h3>
      
      <p className="mb-8 max-w-md text-muted-foreground">
        Create your first encrypted time capsule and send a message to your future self.
        Start your journey through time today.
      </p>
      
      <Button
        size="lg"
        onClick={onCreateFirst}
        data-testid="button-create-first"
        className="glow-primary"
      >
        Create Your First Capsule
      </Button>
    </div>
  );
}
