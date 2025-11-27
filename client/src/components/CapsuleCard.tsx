import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Image, Mic, Lock, CheckCircle2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface CapsuleCardProps {
  id: string;
  title: string;
  content: string;
  scheduledFor: Date;
  createdAt: Date;
  status: 'scheduled' | 'delivered' | 'draft';
  hasPhoto?: boolean;
  hasVoice?: boolean;
  onView?: (id: string) => void;
}

export default function CapsuleCard({
  id,
  title,
  content,
  scheduledFor,
  createdAt,
  status,
  hasPhoto,
  hasVoice,
  onView
}: CapsuleCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'scheduled':
        return <Clock className="h-3 w-3 animate-pulse" />;
      default:
        return <Lock className="h-3 w-3" />;
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case 'delivered':
        return 'secondary' as const;
      case 'scheduled':
        return 'default' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <Card
      className="group relative overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all"
      onClick={() => onView?.(id)}
      data-testid={`card-capsule-${id}`}
    >
      <div className="absolute right-0 top-0 h-px w-0 bg-primary/50 transition-all duration-500 group-hover:w-full" />
      
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="mb-2 font-semibold text-foreground line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {content}
            </p>
          </div>
          
          <Badge variant={getStatusVariant()} className="shrink-0">
            {getStatusIcon()}
            <span className="ml-1">{status}</span>
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDistanceToNow(scheduledFor, { addSuffix: true })}</span>
          </div>
          
          {hasPhoto && (
            <div className="flex items-center gap-1 text-accent-foreground">
              <Image className="h-3 w-3" />
              <span>Photo</span>
            </div>
          )}
          
          {hasVoice && (
            <div className="flex items-center gap-1 text-accent-foreground">
              <Mic className="h-3 w-3" />
              <span>Voice</span>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xs text-muted-foreground">
            Created {formatDistanceToNow(createdAt, { addSuffix: true })}
          </span>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(id);
            }}
            data-testid={`button-view-${id}`}
          >
            View
          </Button>
        </div>
      </div>
    </Card>
  );
}
