import React from 'react';
import { useLocation } from 'react-router-dom';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenanceScreen from './MaintenanceScreen';
import { ShieldAlert, Play } from 'lucide-react';

interface MaintenanceGuardProps {
  children: React.ReactNode;
  branchSlug?: string;
  branchName?: string;
}

export default function MaintenanceGuard({
  children,
  branchSlug,
  branchName
}: MaintenanceGuardProps) {
  const location = useLocation();
  const { settings, isBranchPaused, isAdmin, togglePause } = useMaintenance();

  // Admin routes are never blocked
  if (location.pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  // Determine branch slug from prop or URL pathname
  let detectedSlug = branchSlug;
  if (!detectedSlug) {
    if (location.pathname.startsWith('/kollam')) detectedSlug = 'kollam';
    else if (location.pathname.startsWith('/alappuzha')) detectedSlug = 'alappuzha';
    else if (location.pathname.startsWith('/varkala')) detectedSlug = 'varkala';
  }

  const paused = isBranchPaused(detectedSlug);

  // If paused and visitor is NOT an authenticated admin, show the customer maintenance screen
  if (paused && !isAdmin) {
    return (
      <MaintenanceScreen
        settings={settings}
        branchName={branchName || (detectedSlug ? detectedSlug.toUpperCase() : undefined)}
        isAdmin={false}
      />
    );
  }

  // If paused and visitor IS an admin, show the site with a persistent top reminder banner
  if (paused && isAdmin) {
    return (
      <>
        <div className="sticky top-0 z-50 bg-amber-500 text-neutral-950 px-4 py-2 text-xs sm:text-sm font-semibold shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 max-w-2xl">
            <ShieldAlert className="w-4 h-4 shrink-0 text-neutral-950" />
            <span>
              <strong>MAINTENANCE / PAUSE MODE IS ACTIVE:</strong> Public customers cannot see this content; they see the Pause Screen.
            </span>
          </div>
          <button
            onClick={() => togglePause(false)}
            className="px-3 py-1 rounded bg-neutral-950 hover:bg-neutral-900 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            Resume Website Now
          </button>
        </div>
        {children}
      </>
    );
  }

  // Normal live operation
  return <>{children}</>;
}
