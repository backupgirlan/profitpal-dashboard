import { useState } from 'react';
import ManagementDashboard from '@/components/management/ManagementDashboard';

const Management = () => {
  const [fullscreen, setFullscreen] = useState(false);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <ManagementDashboard fullscreen onToggleFullscreen={() => setFullscreen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ManagementDashboard onToggleFullscreen={() => setFullscreen(true)} />
    </div>
  );
};

export default Management;
