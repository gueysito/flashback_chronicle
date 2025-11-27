import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import DashboardStats from "@/components/DashboardStats";
import CapsuleCard from "@/components/CapsuleCard";
import EmptyState from "@/components/EmptyState";
import TimelineView from "@/components/TimelineView";
import CreateCapsuleModal from "@/components/CreateCapsuleModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, List, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Capsule } from "@shared/schema";

export default function Dashboard() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: capsules = [], isLoading } = useQuery<Capsule[]>({
    queryKey: ["/api/capsules"],
    enabled: isAuthenticated,
  });

  const createCapsuleMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/capsules", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/capsules"] });
      toast({
        title: "Success",
        description: "Time capsule created successfully!",
      });
      setShowCreateModal(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create capsule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const scheduledCapsules = capsules.filter(c => c.status === 'scheduled');
  const deliveredCapsules = capsules.filter(c => c.status === 'delivered');

  const timelineItems = capsules.map(capsule => {
    const isPast = capsule.deliveredAt ? true : false;
    const itemType = capsule.status === 'delivered' ? 'delivered' : 'scheduled';
    return {
      id: capsule.id,
      title: capsule.title,
      date: new Date(capsule.scheduledFor),
      status: (isPast ? 'past' : 'upcoming') as 'past' | 'upcoming',
      type: itemType as 'delivered' | 'scheduled',
    };
  }).sort((a, b) => a.date.getTime() - b.date.getTime());

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your capsules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        onMenuClick={() => console.log('Menu clicked')}
        onNewCapsule={() => setShowCreateModal(true)}
      />
      
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                Your Time Capsules
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Messages traveling through time
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/time-machine">
                <Button variant="outline" data-testid="button-time-machine" className="h-11 px-3 sm:px-4">
                  <Clock className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Time Machine</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
                className="h-11 px-3 sm:px-4"
              >
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {capsules.length === 0 ? (
          <EmptyState onCreateFirst={() => setShowCreateModal(true)} />
        ) : (
          <>
            <DashboardStats
              totalCapsules={capsules.length}
              scheduledCapsules={scheduledCapsules.length}
              deliveredCapsules={deliveredCapsules.length}
            />

            <Tabs defaultValue="grid" className="mt-8">
              <TabsList>
                <TabsTrigger value="grid" data-testid="tab-grid">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="timeline" data-testid="tab-timeline">
                  <List className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {capsules.map((capsule) => (
                    <CapsuleCard
                      key={capsule.id}
                      id={capsule.id}
                      title={capsule.title}
                      content={capsule.content}
                      scheduledFor={new Date(capsule.scheduledFor)}
                      createdAt={capsule.createdAt ? new Date(capsule.createdAt) : new Date()}
                      status={capsule.status as any}
                      hasPhoto={!!capsule.photoUrl}
                      hasVoice={!!capsule.voiceUrl}
                      onView={(id) => console.log('View capsule:', id)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-12">
                <TimelineView
                  items={timelineItems}
                  onItemClick={(id) => console.log('Timeline item:', id)}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <CreateCapsuleModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSave={(data) => createCapsuleMutation.mutate(data)}
      />
    </div>
  );
}
