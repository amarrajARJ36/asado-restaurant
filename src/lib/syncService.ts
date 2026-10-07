/**
 * Real-time synchronization service connecting all devices (Phone 1, Phone 2, admin, guest pages).
 * Provides instantaneous updates across devices via Server-Sent Events (SSE) with HTTP polling fallback.
 */

type SyncListener = (payload: { branchSlug: string; timestamp: number }) => void;

class SyncService {
  private listeners: Set<SyncListener> = new Set();
  private eventSource: EventSource | null = null;
  private pollInterval: any = null;
  private isConnecting = false;
  private lastSyncTimestamp = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initSSE();
      this.startPollingBackup();
      
      // Re-sync when tab gains focus or mobile phone unlocks
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          this.triggerAllListeners('all');
        }
      });
      window.addEventListener('focus', () => {
        this.triggerAllListeners('all');
      });
    }
  }

  private initSSE() {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
    if (this.isConnecting || this.eventSource) return;

    this.isConnecting = true;
    try {
      this.eventSource = new EventSource('/api/sync/stream');

      this.eventSource.onopen = () => {
        this.isConnecting = false;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'sync_update') {
            this.lastSyncTimestamp = payload.lastUpdated || Date.now();
            this.triggerAllListeners(payload.branchSlug || 'all');
          }
        } catch {
          // ignore parse errors
        }
      };

      this.eventSource.onerror = () => {
        this.isConnecting = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Retry connection in 3 seconds
        setTimeout(() => this.initSSE(), 3000);
      };
    } catch {
      this.isConnecting = false;
    }
  }

  private startPollingBackup() {
    // Poll every 5 seconds to guarantee multi-phone consistency even if SSE drops
    this.pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/sync/state');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.lastUpdated && data.lastUpdated > this.lastSyncTimestamp) {
          this.lastSyncTimestamp = data.lastUpdated;
          this.triggerAllListeners('all');
        }
      } catch {
        // quiet error
      }
    }, 5000);
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private triggerAllListeners(branchSlug: string) {
    const payload = { branchSlug, timestamp: Date.now() };
    this.listeners.forEach(fn => {
      try {
        fn(payload);
      } catch (err) {
        console.warn('Sync listener error:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('asado-sync-update', { detail: payload }));
    }
  }

  /**
   * Fetch current synced branch state from server
   */
  public async getBranchState(branchSlug: string): Promise<any | null> {
    try {
      const res = await fetch(`/api/sync/state?branch=${encodeURIComponent(branchSlug)}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch (err) {
      console.warn('Failed to fetch sync state from server:', err);
      return null;
    }
  }

  /**
   * Send update to server to broadcast to all devices immediately
   */
  public async sendUpdate(branchSlug: string, type: string, data: any): Promise<boolean> {
    try {
      const res = await fetch('/api/sync/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchSlug, type, data })
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.lastUpdated) {
          this.lastSyncTimestamp = json.lastUpdated;
        }
        return true;
      }
    } catch (err) {
      console.warn('Failed to send sync update to server:', err);
    }
    return false;
  }

  /**
   * Bulk push local storage data to server (ensures phone 1 local edits are shared to phone 2)
   */
  public async bulkPush(branchSlug: string, payload: any): Promise<void> {
    try {
      await fetch('/api/sync/bulk-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchSlug, ...payload })
      });
    } catch (err) {
      console.warn('Failed to bulk sync to server:', err);
    }
  }
}

export const syncService = new SyncService();
