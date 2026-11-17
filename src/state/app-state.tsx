import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { initialData } from '@/fixtures/initial-data';
import type { AppData, Change } from '@/models/domain';
import { createRepository } from '@/services/repository';
import { storage } from '@/services/storage';

const repository = createRepository(storage);
interface AppState {
  data: AppData; ready: boolean; busy: boolean; error: string | null; loadError: string | null;
  change: (update: Change) => Promise<boolean>; retry: () => void; reset: () => Promise<boolean>; clearError: () => void;
}
const Context = createContext<AppState | null>(null);
export function AppProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState(initialData);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const current = useRef(data);
  const locked = useRef(false);
  useEffect(() => {
    let alive = true;
    setReady(false); setLoadError(null);
    repository.load().then(saved => {
      if (!alive) return;
      const value = saved ?? initialData(); current.current = value; setData(value); setReady(true);
    }).catch(() => { if (alive) setLoadError('We couldn’t open your local data. Retry, or start a fresh demo. Your existing file has not been overwritten.'); });
    return () => { alive = false; };
  }, [attempt]);
  const commit = useCallback(async (update: Change, allowReset = false) => {
    if (locked.current || (!ready && !allowReset)) return false;
    locked.current = true; setBusy(true); setError(null);
    try {
      const next = update(current.current);
      await repository.save(next);
      current.current = next; setData(next); setReady(true); setLoadError(null);
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Your changes couldn’t be saved. Please try again.'); return false; }
    finally { locked.current = false; setBusy(false); }
  }, [ready]);
  return <Context.Provider value={{ data, ready, busy, error, loadError,
    change: update => commit(update), retry: () => setAttempt(a => a + 1),
    reset: () => commit(() => initialData(), true), clearError: () => setError(null) }}>{children}</Context.Provider>;
}
export function useApp() { const state = useContext(Context); if (!state) throw new Error('useApp requires AppProvider'); return state; }
