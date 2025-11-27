import { Lock, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick?: () => void;
  onNewCapsule?: () => void;
}

export default function Header({ onMenuClick, onNewCapsule }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            data-testid="button-menu"
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/40 bg-primary/10">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-foreground">Flash</span>
              <span className="text-primary">Back</span>
            </span>
          </div>
        </div>
        
        <Button
          onClick={onNewCapsule}
          data-testid="button-new-capsule"
          className="glow-primary h-11"
        >
          New Capsule
        </Button>
      </div>
    </header>
  );
}
