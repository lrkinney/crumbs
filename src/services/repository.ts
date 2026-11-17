import type { AppData } from '../models/domain.ts';
import { parseData } from './validation.ts';

export interface StorageAdapter { read(): Promise<string | null>; write(value: string): Promise<void> }
export interface Repository { load(): Promise<AppData | null>; save(data: AppData): Promise<void> }
export function createRepository(adapter: StorageAdapter): Repository {
  return {
    async load() { const raw = await adapter.read(); return raw === null ? null : parseData(raw); },
    async save(data) { const raw = JSON.stringify(data); parseData(raw); await adapter.write(raw); },
  };
}
