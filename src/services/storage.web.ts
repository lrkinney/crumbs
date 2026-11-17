const key = 'crumbs-state-v1';
export const storage = {
  async read(): Promise<string | null> { return globalThis.localStorage.getItem(key); },
  async write(value: string): Promise<void> { globalThis.localStorage.setItem(key, value); },
};
