import CapsuleCard from '../CapsuleCard';

export default function CapsuleCardExample() {
  return (
    <div className="p-8 space-y-4">
      <CapsuleCard
        id="1"
        title="Remember this moment"
        content="A reflection on where I am today and where I hope to be in the future. This capsule contains my dreams, fears, and aspirations."
        scheduledFor={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
        createdAt={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
        status="scheduled"
        hasPhoto={true}
        hasVoice={false}
        onView={(id) => console.log('View capsule:', id)}
      />
      <CapsuleCard
        id="2"
        title="My goals for 2025"
        content="Setting intentions for the year ahead. What I want to accomplish, who I want to become, and the impact I want to make."
        scheduledFor={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
        createdAt={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
        status="scheduled"
        hasVoice={true}
        onView={(id) => console.log('View capsule:', id)}
      />
      <CapsuleCard
        id="3"
        title="A letter to past me"
        content="Looking back at who I was and how far I've come. Grateful for the journey and excited for what's next."
        scheduledFor={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
        createdAt={new Date(Date.now() - 395 * 24 * 60 * 60 * 1000)}
        status="delivered"
        onView={(id) => console.log('View capsule:', id)}
      />
    </div>
  );
}
