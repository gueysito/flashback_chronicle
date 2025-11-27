import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export interface TimelineItem {
  id: string;
  title: string;
  date: Date;
  status: 'past' | 'upcoming';
  type: 'delivered' | 'scheduled';
}

interface TimelineViewProps {
  items: TimelineItem[];
  onItemClick?: (id: string) => void;
}

export default function TimelineView({ items, onItemClick }: TimelineViewProps) {
  return (
    <div className="relative">
      <div className="absolute left-8 top-0 bottom-0 w-px bg-border md:left-1/2" />
      
      <div className="space-y-8">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`relative flex items-center gap-8 ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            }`}
            data-testid={`timeline-item-${item.id}`}
          >
            <div className="hidden md:block md:flex-1" />
            
            <div
              className={`absolute left-8 md:left-1/2 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 ${
                item.status === 'past'
                  ? 'border-primary bg-primary'
                  : 'border-muted-foreground bg-background'
              }`}
            >
              {item.status === 'past' && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
              )}
            </div>
            
            <Card
              className={`flex-1 cursor-pointer hover-elevate active-elevate-2 transition-all ml-16 md:ml-0 ${
                item.status === 'upcoming' ? 'opacity-60' : ''
              }`}
              onClick={() => onItemClick?.(item.id)}
            >
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <Badge
                    variant={item.type === 'delivered' ? 'secondary' : 'default'}
                  >
                    {item.type === 'delivered' ? (
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                    ) : (
                      <Clock className="h-3 w-3 mr-1" />
                    )}
                    {item.type}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{format(item.date, 'MMM d, yyyy')}</span>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
