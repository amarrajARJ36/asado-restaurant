import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { MaintenanceSettings } from '../types';

const STORAGE_KEY = 'asado_maintenance_settings';

export const DEFAULT_MAINTENANCE_SETTINGS: MaintenanceSettings = {
  isPaused: false,
  pauseTitle: 'Temporarily Paused for Maintenance',
  pauseMessage: 'We are currently performing scheduled maintenance and updates to Asado Cafe. We will be back online shortly to serve you!',
  expectedBack: 'Check back soon',
  contactPhone: '+91 95625 36000',
  contactEmail: 'info@asadocafe.com',
  pausedBranches: [],
  updatedAt: Date.now(),
  updatedBy: 'Admin'
};

function getLocalSettings(): MaintenanceSettings {
  if (typeof window === 'undefined') return DEFAULT_MAINTENANCE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.isPaused === 'boolean') {
        return {
          ...DEFAULT_MAINTENANCE_SETTINGS,
          ...parsed,
          pausedBranches: Array.isArray(parsed.pausedBranches) ? parsed.pausedBranches : []
        };
      }
    }
  } catch (e) {
    console.warn('Failed to parse cached maintenance settings:', e);
  }
  return DEFAULT_MAINTENANCE_SETTINGS;
}

function saveLocalSettings(settings: MaintenanceSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('asado_maintenance_changed'));
  } catch (e) {
    console.warn('Failed to cache maintenance settings:', e);
  }
}

export function useMaintenance() {
  const [settings, setSettings] = useState<MaintenanceSettings>(getLocalSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      localStorage.getItem('asado_admin_auth') === 'true' ||
      sessionStorage.getItem('asado_admin_auth') === 'true'
    );
  });

  // Listen to admin authentication state changes
  useEffect(() => {
    const checkAdmin = () => {
      const auth =
        localStorage.getItem('asado_admin_auth') === 'true' ||
        sessionStorage.getItem('asado_admin_auth') === 'true';
      setIsAdmin(auth);
    };

    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, []);

  // Sync from backend API on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchApiSettings() {
      try {
        const res = await fetch('/api/settings/maintenance');
        if (res.ok) {
          const data = await res.json();
          if (data && data.settings && isMounted) {
            setSettings(prev => {
              const merged = { ...prev, ...data.settings };
              saveLocalSettings(merged);
              return merged;
            });
          }
        }
      } catch (err) {
        // Fallback silently if offline
      }
    }

    fetchApiSettings();

    // Listen to local window broadcast events
    const handleLocalChange = () => {
      setSettings(getLocalSettings());
    };
    window.addEventListener('asado_maintenance_changed', handleLocalChange);

    return () => {
      isMounted = false;
      window.removeEventListener('asado_maintenance_changed', handleLocalChange);
    };
  }, []);

  // Real-time Firestore sync
  useEffect(() => {
    let unsubscribe = () => {};
    const docRef = doc(db, 'settings', 'maintenance');

    try {
      unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          setLoading(false);
          if (snapshot.exists()) {
            const data = snapshot.data();
            const loadedSettings: MaintenanceSettings = {
              isPaused: Boolean(data.isPaused),
              pauseTitle: data.pauseTitle || DEFAULT_MAINTENANCE_SETTINGS.pauseTitle,
              pauseMessage: data.pauseMessage || DEFAULT_MAINTENANCE_SETTINGS.pauseMessage,
              expectedBack: data.expectedBack || DEFAULT_MAINTENANCE_SETTINGS.expectedBack,
              contactPhone: data.contactPhone || DEFAULT_MAINTENANCE_SETTINGS.contactPhone,
              contactEmail: data.contactEmail || DEFAULT_MAINTENANCE_SETTINGS.contactEmail,
              pausedBranches: Array.isArray(data.pausedBranches) ? data.pausedBranches : [],
              updatedAt: data.updatedAt || Date.now(),
              updatedBy: data.updatedBy || 'Admin'
            };
            setSettings(loadedSettings);
            saveLocalSettings(loadedSettings);
          }
        },
        (error) => {
          setLoading(false);
          try {
            handleFirestoreError(error, OperationType.GET, 'settings/maintenance');
          } catch {
            // graceful fallback to local / api state
          }
        }
      );
    } catch {
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const updateMaintenance = useCallback(
    async (partial: Partial<MaintenanceSettings>) => {
      const updated: MaintenanceSettings = {
        ...settings,
        ...partial,
        updatedAt: Date.now(),
        updatedBy: 'Admin'
      };

      // 1. Immediate optimistic update in state and localStorage
      setSettings(updated);
      saveLocalSettings(updated);

      // 2. Persist to Firestore
      try {
        const docRef = doc(db, 'settings', 'maintenance');
        await setDoc(docRef, updated, { merge: true });
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.WRITE, 'settings/maintenance');
        } catch (e) {
          console.warn('Firestore write warning:', e);
        }
      }

      // 3. Persist to server.ts backend endpoint
      try {
        await fetch('/api/settings/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated)
        });
      } catch (apiErr) {
        console.warn('Backend API save warning:', apiErr);
      }
    },
    [settings]
  );

  const togglePause = useCallback(
    async (overrideState?: boolean) => {
      const nextPaused = typeof overrideState === 'boolean' ? overrideState : !settings.isPaused;
      await updateMaintenance({ isPaused: nextPaused });
    },
    [settings.isPaused, updateMaintenance]
  );

  const isBranchPaused = useCallback(
    (branchSlug?: string): boolean => {
      if (!settings.isPaused) return false;
      // If no specific branches listed, it means ALL branches are paused (global pause)
      if (!settings.pausedBranches || settings.pausedBranches.length === 0) {
        return true;
      }
      if (!branchSlug) return true;
      return settings.pausedBranches.includes(branchSlug.toLowerCase());
    },
    [settings.isPaused, settings.pausedBranches]
  );

  return {
    settings,
    loading,
    isAdmin,
    isPaused: settings.isPaused,
    isBranchPaused,
    updateMaintenance,
    togglePause
  };
}
