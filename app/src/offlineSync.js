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
    console.error('[OfflineSync] Erreur lecture de la file hors-ligne:', e);
    return [];
  }
};

/**
 * Add an action to the offline queue
 * @param {Object} action - { type: 'INSERT'|'UPSERT'|'DELETE', table: string, data: Object }
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
    
    // Dispatch event to update status indicators across the app
    window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { queue } }));
    console.log('[OfflineSync] Action enregistrée en file hors-ligne:', item);
    return item;
  } catch (e) {
    console.error('[OfflineSync] Erreur d\'écriture file hors-ligne:', e);
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
 * Synchronize any unsynced local photos (starting with off_) to Supabase Cloud
 */
export const syncLocalPhotosToSupabase = async () => {
  if (!isOnline()) return;
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    const raw = localStorage.getItem('dublin_gallery_photos');
    if (!raw) return;
    const photos = JSON.parse(raw);
    const unsynced = photos.filter(p => p.id && String(p.id).startsWith('off_') && (p.src || p.image));

    if (unsynced.length === 0) return;

    console.log(`[OfflineSync] Synchro de ${unsynced.length} photo(s) locale(s) vers Supabase Cloud...`);

    for (const photo of unsynced) {
      const payload = { image: photo.src || photo.image };
      const { data, error } = await supabase.from('dublin_photos').insert([payload]).select();
      if (!error && data && data[0]?.id) {
        const realId = data[0].id;
        const currentRaw = localStorage.getItem('dublin_gallery_photos');
        const currentPhotos = currentRaw ? JSON.parse(currentRaw) : [];
        const updated = currentPhotos.map(p => String(p.id) === String(photo.id) ? { ...p, id: realId, src: photo.src || photo.image } : p);
        localStorage.setItem('dublin_gallery_photos', JSON.stringify(updated));
      }
    }
    window.dispatchEvent(new CustomEvent('offline-sync-complete'));
  } catch (err) {
    console.warn('[OfflineSync] Erreur synchro photos locales:', err);
  }
};

/**
 * Process and synchronize all queued offline items with Supabase
 */
export const syncOfflineQueue = async () => {
  if (!isOnline()) {
    console.log('[OfflineSync] Navigateur hors-ligne. Synchro différée.');
    return { success: false, syncedCount: 0, reason: 'offline' };
  }

  const supabase = getSupabase();
  if (!supabase) {
    console.log('[OfflineSync] Supabase non configuré. Mode local uniquement.');
    return { success: false, syncedCount: 0, reason: 'no-supabase' };
  }

  // Also sync any local photos waiting in localStorage
  await syncLocalPhotosToSupabase();

  const queue = getOfflineQueue();
  if (queue.length === 0) {
    return { success: true, syncedCount: 0, remaining: 0 };
  }

  console.log(`[OfflineSync] Début de la synchronisation de ${queue.length} élément(s)...`);
  window.dispatchEvent(new CustomEvent('offline-sync-start', { detail: { count: queue.length } }));

  let syncedCount = 0;
  const remainingQueue = [];

  for (const item of queue) {
    try {
      let error = null;
      const payload = Array.isArray(item.data) ? item.data : [item.data];

      if (item.type === 'INSERT') {
        const { error: err } = await supabase.from(item.table).insert(payload);
        error = err;
      } else if (item.type === 'UPSERT') {
        const { error: err } = await supabase.from(item.table).upsert(payload);
        error = err;
      } else if (item.type === 'DELETE') {
        if (item.data?.id) {
          const { error: err } = await supabase.from(item.table).delete().eq('id', item.data.id);
          error = err;
        } else {
          const { error: err } = await supabase.from(item.table).delete().match(item.data);
          error = err;
        }
      }

      if (error) {
        console.warn(`[OfflineSync] Échec d'envoi pour la table ${item.table}:`, error.message || error);
        remainingQueue.push(item);
      } else {
        syncedCount++;
        console.log(`[OfflineSync] Synchro réussie pour ${item.table}:`, item);
      }
    } catch (err) {
      console.error(`[OfflineSync] Exception réseau lors de l'envoi vers ${item.table}:`, err);
      remainingQueue.push(item);
    }
  }

  // Update storage with remaining queue
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
  window.dispatchEvent(new CustomEvent('offline-queue-changed', { detail: { queue: remainingQueue } }));
  window.dispatchEvent(new CustomEvent('offline-sync-complete', { detail: { syncedCount, remaining: remainingQueue.length } }));

  return { success: true, syncedCount, remaining: remainingQueue.length };
};

// Global Event Listeners for automatic auto-sync with retries when connection is restored
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('[OfflineSync] Connexion rétablie ! Lancement de la synchronisation différée...');
    window.dispatchEvent(new CustomEvent('network-status-changed', { detail: { online: true } }));

    // Retry loop (3 attempts with progressive delay to allow mobile network sockets to stabilize)
    for (let attempt = 1; attempt <= 3; attempt++) {
      await new Promise(resolve => setTimeout(resolve, attempt * 1200));
      const result = await syncOfflineQueue();
      if (result.syncedCount > 0 || result.remaining === 0) {
        break;
      }
    }
  });

  window.addEventListener('offline', () => {
    console.log('[OfflineSync] Déconnexion réseau détectée. Bascule en mode hors-ligne.');
    window.dispatchEvent(new CustomEvent('network-status-changed', { detail: { online: false } }));
  });
}
