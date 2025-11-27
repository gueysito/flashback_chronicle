import DashboardStats from '../DashboardStats';

export default function DashboardStatsExample() {
  return (
    <div className="p-8">
      <DashboardStats
        totalCapsules={12}
        scheduledCapsules={8}
        deliveredCapsules={4}
        nextDelivery={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
      />
    </div>
  );
}
