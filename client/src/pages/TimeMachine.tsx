import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarIcon, PackageIcon, ClockIcon, Flame } from 'lucide-react';

interface Analytics {
  totalCapsules: number;
  deliveredCapsules: number;
  scheduledCapsules: number;
  selfDestructedCapsules: number;
}

interface WordCloudData {
  words: string[];
}

export default function TimeMachine() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ['/api/analytics'],
  });

  const { data: wordCloudData, isLoading: wordCloudLoading } = useQuery<WordCloudData>({
    queryKey: ['/api/analytics/wordcloud'],
  });

  const { data: capsulesData } = useQuery<any[]>({
    queryKey: ['/api/capsules'],
  });

  const stats = [
    {
      title: 'Total Capsules',
      value: analytics?.totalCapsules || 0,
      icon: PackageIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Delivered',
      value: analytics?.deliveredCapsules || 0,
      icon: CalendarIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Scheduled',
      value: analytics?.scheduledCapsules || 0,
      icon: ClockIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Self-Destructed',
      value: analytics?.selfDestructedCapsules || 0,
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  const sortedCapsules = capsulesData
    ? [...capsulesData].sort(
        (a, b) =>
          new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      )
    : [];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6" data-testid="page-timemachine">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="heading-timemachine">
            Personal Time Machine
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Explore your journey through time capsules and memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {analyticsLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="space-y-0 pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            stats.map((stat) => (
              <Card key={stat.title} data-testid={`card-stat-${stat.title.toLowerCase().replace(' ', '-')}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-md ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color}`} data-testid={`value-${stat.title.toLowerCase().replace(' ', '-')}`}>
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card data-testid="card-wordcloud">
            <CardHeader>
              <CardTitle>Word Cloud</CardTitle>
              <p className="text-sm text-muted-foreground">
                Most common themes in your capsules
              </p>
            </CardHeader>
            <CardContent>
              {wordCloudLoading ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-8 w-20" />
                  ))}
                </div>
              ) : wordCloudData?.words && wordCloudData.words.length > 0 ? (
                <div className="flex flex-wrap gap-2" data-testid="wordcloud-container">
                  {wordCloudData.words.map((word: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      style={{
                        fontSize: `${Math.max(12, 20 - index * 0.5)}px`,
                      }}
                      data-testid={`word-${index}`}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Create more capsules to see word patterns
                </p>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-timeline">
            <CardHeader>
              <CardTitle>Capsule Timeline</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upcoming and delivered capsules
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {sortedCapsules.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No capsules created yet
                  </p>
                ) : (
                  sortedCapsules.slice(0, 10).map((capsule) => (
                    <div
                      key={capsule.id}
                      className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
                      data-testid={`timeline-item-${capsule.id}`}
                    >
                      <div
                        className={`mt-1 w-2 h-2 rounded-full ${
                          capsule.deliveredAt
                            ? 'bg-green-500'
                            : new Date(capsule.scheduledFor) > new Date()
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {capsule.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {capsule.deliveredAt
                            ? `Delivered ${new Date(
                                capsule.deliveredAt
                              ).toLocaleDateString()}`
                            : `Scheduled for ${new Date(
                                capsule.scheduledFor
                              ).toLocaleDateString()}`}
                        </p>
                        {capsule.spotifyTrackName && (
                          <p className="text-xs text-primary mt-1">
                            🎵 {capsule.spotifyTrackName}
                          </p>
                        )}
                        {capsule.locationName && (
                          <p className="text-xs text-primary mt-1">
                            📍 {capsule.locationName}
                          </p>
                        )}
                        {capsule.selfDestruct && (
                          <p className="text-xs text-red-500 mt-1">🔥 Self-destruct enabled</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-recent-capsules">
          <CardHeader>
            <CardTitle>All Capsules</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your complete time capsule collection
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {capsulesData && capsulesData.length > 0 ? (
                capsulesData.map((capsule) => (
                  <div
                    key={capsule.id}
                    className="flex items-center justify-between p-4 border border-border rounded-md hover-elevate active-elevate-2"
                    data-testid={`capsule-item-${capsule.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">
                          {capsule.title}
                        </h3>
                        {capsule.selfDestruct && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded">
                            Self-Destruct
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(capsule.scheduledFor).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {capsule.spotifyTrackName && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            🎵 Music
                          </span>
                        )}
                        {capsule.locationName && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            📍 Location
                          </span>
                        )}
                        {capsule.photoUrl && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            📷 Photo
                          </span>
                        )}
                        {capsule.voiceUrl && (
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            🎤 Voice
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      {capsule.deliveredAt ? (
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium" data-testid={`status-delivered-${capsule.id}`}>
                          Delivered
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium" data-testid={`status-scheduled-${capsule.id}`}>
                          Scheduled
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No capsules created yet. Create your first time capsule to get started!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
