// hooks/useMetals.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { METAL_SYMBOLS, MetalModel } from '../constants/Types';
import { fetchAllMetals } from './api';

const CACHE_KEY = 'metals_cache_v1';
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h


const REFRESH_QUOTA_KEY = 'metals_refresh_quota_v1';
const REFRESH_LIMIT = 2;            // max refreshes
const QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

type CacheShape = { metals: MetalModel[]; timestamp: number };
type RefreshQuota = { count: number; resetAt: number };

function isFresh(ts: number, ttlMs: number) {
  return Date.now() - ts < ttlMs;
}

async function getQuota(): Promise<RefreshQuota> {
  const now = Date.now();
  try {
    const raw = await AsyncStorage.getItem(REFRESH_QUOTA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as RefreshQuota;
      if (now >= parsed.resetAt) {
        // window reset
        const next: RefreshQuota = { count: 0, resetAt: now + QUOTA_WINDOW_MS };
        await AsyncStorage.setItem(REFRESH_QUOTA_KEY, JSON.stringify(next));
        return next;
      }
      return parsed;
    }
  } catch {}
  const fresh: RefreshQuota = { count: 0, resetAt: now + QUOTA_WINDOW_MS };
  await AsyncStorage.setItem(REFRESH_QUOTA_KEY, JSON.stringify(fresh));
  return fresh;
}

async function bumpQuota(): Promise<RefreshQuota> {
  const now = Date.now();
  const q = await getQuota();
  const next: RefreshQuota =
    now >= q.resetAt
      ? { count: 1, resetAt: now + QUOTA_WINDOW_MS }
      : { count: q.count + 1, resetAt: q.resetAt };
  await AsyncStorage.setItem(REFRESH_QUOTA_KEY, JSON.stringify(next));
  return next;
}

export function useMetals(apiKey?: string, ttlMs: number = DEFAULT_TTL_MS) {
  const [metals, setMetals] = useState<MetalModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loaders, setLoaders] = useState<Record<string, boolean>>({});
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // NEW: quota state surfaced to UI
  const [remainingRefreshes, setRemainingRefreshes] = useState<number>(REFRESH_LIMIT);
  const [refreshResetAt, setRefreshResetAt] = useState<number | null>(null);

  const firstLoadDone = useRef(false);

  const turnOnTileLoaders = useCallback(() => {
    const base: Record<string, boolean> = {};
    METAL_SYMBOLS.forEach((s) => (base[s.toLowerCase()] = true));
    setLoaders(base);
  }, []);

  const turnOffTileLoaders = useCallback(() => {
    setLoaders((prev) => {
      const next = { ...prev };
      METAL_SYMBOLS.forEach((s) => (next[s.toLowerCase()] = false));
      return next;
    });
  }, []);

  const loadFromCache = useCallback(async (): Promise<CacheShape | null> => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as CacheShape;
    } catch {
      return null;
    }
  }, []);

  const saveToCache = useCallback(async (data: CacheShape) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
  }, []);

  const refresh = useCallback(
    async (opts?: { forceNetwork?: boolean }) => {
      const forceNetwork = !!opts?.forceNetwork;
      setError(null);
      turnOnTileLoaders();
      setLoading((prev) => (firstLoadDone.current ? prev : true));

      try {
        const cached = await loadFromCache();

        // if not forced and cache fresh, skip network
        if (!forceNetwork && cached && isFresh(cached.timestamp, ttlMs)) {
          setMetals(cached.metals);
          setLastUpdated(cached.timestamp);
          setError(null);
          return;
        }

        // network fetch
        const { ok, failed } = await fetchAllMetals(apiKey);
        setMetals(ok);
        const now = Date.now();
        setLastUpdated(now);
        await saveToCache({ metals: ok, timestamp: now });
        if (failed.length) setError(`Some symbols failed: ${failed.join(', ')}`);
      } catch (e: any) {
        const cached = await loadFromCache();
        if (cached) {
          setMetals(cached.metals);
          setLastUpdated(cached.timestamp);
          setError(e?.message || 'Using cached data due to network/API issue.');
        } else {
          setError(e?.message || 'Failed fetching prices and no cache available.');
        }
      } finally {
        firstLoadDone.current = true;
        setLoading(false);
        setRefreshing(false);
        turnOffTileLoaders();
      }
    },
    [apiKey, ttlMs, loadFromCache, saveToCache, turnOnTileLoaders, turnOffTileLoaders]
  );


  const tryForceRefresh = useCallback(async (): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> => {
    const q = await getQuota();
    const remaining = Math.max(REFRESH_LIMIT - q.count, 0);
    if (remaining <= 0) {
      // block; do not call network
      setError('Refresh limit reached (2 per 24h). Try again later to avoid exceeding API quota.');
      setRemainingRefreshes(0);
      setRefreshResetAt(q.resetAt);
      return { allowed: false, remaining: 0, resetAt: q.resetAt };
    }

    // consume one and do a forced refresh
    const next = await bumpQuota();
    setRemainingRefreshes(Math.max(REFRESH_LIMIT - next.count, 0));
    setRefreshResetAt(next.resetAt);

    setRefreshing(true);
    await refresh({ forceNetwork: true });

    return {
      allowed: true,
      remaining: Math.max(REFRESH_LIMIT - next.count, 0),
      resetAt: next.resetAt,
    };
  }, [refresh]);

  // Initialize quota counters on mount
  useEffect(() => {
    (async () => {
      const q = await getQuota();
      setRemainingRefreshes(Math.max(REFRESH_LIMIT - q.count, 0));
      setRefreshResetAt(q.resetAt);
    })();
  }, []);

  useEffect(() => {
    // initial load: prefer cache; no forced network
    refresh({ forceNetwork: false });
  }, [refresh]);

  const onPull = useCallback(() => {
    setRefreshing(true);
    // Pull-to-refresh tries to consume quota
    tryForceRefresh();
  }, [tryForceRefresh]);

  return useMemo(
    () => ({
      metals,
      loading,
      error,
      refreshing,
      loaders,
      lastUpdated,
      onPull,
      refresh,  
      tryForceRefresh,
      remainingRefreshes,
      refreshResetAt,
    }),
    [
      metals,
      loading,
      error,
      refreshing,
      loaders,
      lastUpdated,
      onPull,
      refresh,
      tryForceRefresh,
      remainingRefreshes,
      refreshResetAt,
    ]
  );
}