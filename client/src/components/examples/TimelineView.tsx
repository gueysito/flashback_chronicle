import TimelineView from '../TimelineView';

export default function TimelineViewExample() {
  const items = [
    {
      id: '1',
      title: 'New Year Reflections',
      date: new Date(2024, 0, 1),
      status: 'past' as const,
      type: 'delivered' as const,
    },
    {
      id: '2',
      title: 'Summer Goals',
      date: new Date(2024, 5, 15),
      status: 'past' as const,
      type: 'delivered' as const,
    },
    {
      id: '3',
      title: 'Birthday Message',
      date: new Date(2025, 2, 20),
      status: 'upcoming' as const,
      type: 'scheduled' as const,
    },
    {
      id: '4',
      title: 'Five Year Vision',
      date: new Date(2029, 11, 31),
      status: 'upcoming' as const,
      type: 'scheduled' as const,
    },
  ];

  return (
    <div className="p-8">
      <TimelineView items={items} onItemClick={(id) => console.log('Timeline item:', id)} />
    </div>
  );
}
