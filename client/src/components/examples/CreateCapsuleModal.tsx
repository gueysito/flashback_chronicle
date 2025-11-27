import { useState } from 'react';
import CreateCapsuleModal from '../CreateCapsuleModal';
import { Button } from '@/components/ui/button';

export default function CreateCapsuleModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <CreateCapsuleModal
        open={open}
        onOpenChange={setOpen}
        onSave={(data) => console.log('Capsule saved:', data)}
      />
    </div>
  );
}
