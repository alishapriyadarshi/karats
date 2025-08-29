// hooks/useMetals.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MetalModel } from '../constants/Types';
import { fetchAllMetals } from './api';
import { mockAllModels } from './mock';

type Source = 'mock' | 'live' | 'cache';

const CACHE_KEY = 'metals_cache_v1';
const QUOTA_KEY = 'refresh_quota_v1';
const REFRESH_LIMIT = 2; // max 2/day
const WINDOW_MS = 24 * 60 * 60 * 1000;

// --- quota helpers ---
async function readQuota() {
  const now = Date.now();
  try {
    const raw = await AsyncStorage.getItem(QUOTA_KEY);
    if (raw) {
      const q = JSON.parse(raw) as { count: number; resetAt: number };
      if (now >= q.resetAt) {
        const next = { count: 0, resetAt: now + WINDOW_MS };
        await AsyncStorage.setItem(QUOTA_KEY, JSON.stringify(next));
        return next;
      }
      return q;
    }
  } catch {}
  const init = { count: 0, resetAt: now + WINDOW_MS };
  await AsyncStorage.setItem(QUOTA_KEY, JSON.stringify(init));
  return init;
}
async function consumeQuota() {
  const now = Date.now();
  const q = await readQuota();
  const next =
    now >= q.resetAt
      ? { count: 1, resetAt: now + WINDOW_MS }
      : { count: q.count + 1, resetAt: q.resetAt };
  await AsyncStorage.setItem(QUOTA_KEY, JSON.stringify(next));
  return next;
}

export function useMetals(apiKey?: string) {
  const [metals, setMetals] = useState<MetalModel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState<Source>('mock');
  const [remaining, setRemaining] = useState<number>(REFRESH_LIMIT);

  // initial: always mock
  useEffect(() => {
    (async () => {
      const mock = await mockAllModels();
      setMetals(mock);
      setLoading(false);

      const q = await readQuota();
      setRemaining(Math.max(REFRESH_LIMIT - q.count, 0));
    })();
  }, []);


  const refreshLabel = useMemo(() => {
    if (remaining === REFRESH_LIMIT) {
      // never fetched yet or reset to new day
      return metals.length && source !== 'mock'
        ? 'Refresh'
        : 'Fetch latest prices';
    }
    if (remaining === 1) return 'Refresh (one left for today)';
    if (remaining <= 0) return 'Refresh (limit reached)';
    return 'Refresh';
  }, [remaining, metals.length, source]);

  const fetchLive = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const { ok } = await fetchAllMetals(apiKey);
      setMetals(ok);
      setSource('live');

      const q = await consumeQuota();
      setRemaining(Math.max(REFRESH_LIMIT - q.count, 0));
    } catch (e: any) {
      setError(e?.message || 'Failed to fetch live data. Showing mock.');
      const mock = await mockAllModels();
      setMetals(mock);
      setSource('mock');

      const q = await consumeQuota();
      setRemaining(Math.max(REFRESH_LIMIT - q.count, 0));
    } finally {
      setRefreshing(false);
    }
  }, [apiKey]);

  return {
    metals,
    error,
    loading,
    refreshing,
    source,
    refreshLabel,
    remaining,
    fetchLive,
  };
}