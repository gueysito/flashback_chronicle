import EmptyState from '../EmptyState';

export default function EmptyStateExample() {
  return <EmptyState onCreateFirst={() => console.log('Create first capsule')} />;
}
