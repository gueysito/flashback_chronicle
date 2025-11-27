import { Card } from "@/components/ui/card";
import { Calendar, CheckCircle2, Clock, Lock } from "lucide-react";

interface DashboardStatsProps {
  totalCapsules: number;
  scheduledCapsules: number;
  deliveredCapsules: number;
  nextDelivery?: Date;
}

export default function DashboardStats({
  totalCapsules,
  scheduledCapsules,
  deliveredCapsules,
  nextDelivery
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Total Capsules',
      value: totalCapsules,
      icon: Lock,
      color: 'text-primary',
    },
    {
      label: 'Scheduled',
      value: scheduledCapsules,
      icon: Clock,
      color: 'text-accent-foreground',
    },
    {
      label: 'Delivered',
      value: deliveredCapsules,
      icon: CheckCircle2,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="hover-elevate transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="font-serif text-3xl font-bold text-foreground">
                {stat.value}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
