import { getSupabase } from './supabase';

const QUEUE_KEY = 'dublin_offline_queue';

/**
 * Check if the browser currently has network connectivity
 */
export const isOnline = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * Get all pending actions from the offline queue
 */
export const getOfflineQueue = () => {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('[OfflineSync] Error reading offline queue:', e);
    return [];
  }
};

/**
 * Add an action to the offline queue
 * @param {Object} action - { type: 'INSERT'|'UPDATE'|'DELETE', table: string, data: Object }
 */
export const addToOfflineQueue = (action) => {
  try {
    const queue = getOfflineQueue();
    const item = {
      id: 'off_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      ...action
    };
    queue.push(item);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    
    // Notify listeners
    window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { queue } }));
    console.log('[OfflineSync] Action ajoutée à la file d\'attente hors-ligne:', item);
    return item;
  } catch (e) {
    console.error('[OfflineSync] Erreur ajout file hors-ligne:', e);
  }
};

/**
 * Clear the offline queue
 */
export const clearOfflineQueue = () => {
  localStorage.removeItem(QUEUE_KEY);
  window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { queue: [] } }));
};

/**
 * Process and synchronize all queued offline items with Supabase
 */
export const syncOfflineQueue = async () => {
  if (!isOnline()) {
    console.log('[OfflineSync] Navigateur toujours hors-ligne. Synchronisation différée.');
    return { success: false, syncedCount: 0, reason: 'offline' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.log('[OfflineSync] Supabase non configuré. Mode local pur.');
    return { success: false, syncedCount: 0, reason: 'no-supabase' };
  }

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { success: true, syncedCount: 0 };
  }

  console.log(`[OfflineSync] Début de la synchronisation de ${queue.length} action(s) hors-ligne...`);
  window.dispatchEvent(new CustomEvent('offline-sync-start', { detail: { count: queue.length } }));

  let syncedCount = 0;
  const remainingQueue = [];

  for (const item of queue) {
    try {
      let error = null;
      if (item.type === 'INSERT' || item.type === 'UPSERT') {
        const { error: err } = await supabase.from(item.table).upsert(item.data);
        error = err;
      } else if (item.type === 'DELETE') {
        const { error: err } = await supabase.from(item.table).delete().match(item.data);
        error = err;
      }

      if (error) {
        console.warn(`[OfflineSync] Échec sync pour ${item.table}:`, error.message);
        remainingQueue.push(item); // Keep in queue to retry later
      } else {
        syncedCount++;
        console.log(`[OfflineSync] Action synchronisée avec succès:`, item);
      }
    } catch (err) {
      console.error(`[OfflineSync] Erreur réseau lors de la synchro de ${item.table}:`, err);
      remainingQueue.push(item);
    }
  }

  // Update storage with remaining queue
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
  window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { queue: remainingQueue } }));
  window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: { syncedCount, remaining: remainingQueue.length } }));

  return { success: true, syncedCount, remaining: remainingQueue.length };
};

// Global Event Listeners for automatic auto-sync when connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[OfflineSync] Connexion réseau rétablie ! Lancement de la synchronisation...');
    window.dispatchEvent(new CustomEvent('network-status-changed', { detail: { online: true } }));
    setTimeout(() => {
      syncOfflineQueue();
    }, 1500);
  });

  window.addEventListener('offline', () => {
    console.log('[OfflineSync] Perte de la connexion réseau. Bascule en mode hors-ligne.');
    window.dispatchEvent(new CustomEvent('network-status-changed', { detail: { online: false } }));
  });
}
