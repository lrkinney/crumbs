import { File, Paths } from 'expo-file-system';

// Native-only module; Metro selects storage.web.ts in the browser.
const file = () => new File(Paths.document, 'crumbs-state-v1.json');
export const storage = {
  async read(): Promise<string | null> {
    const current = file(); const backup = new File(Paths.document, 'crumbs-state-v1.bak');
    return current.exists ? current.text() : backup.exists ? backup.text() : null;
  },
  async write(value: string): Promise<void> {
    // Keep a previous snapshot while replacing the current file.
    const temporary = new File(Paths.document, 'crumbs-state-v1.tmp');
    await temporary.write(value);
    if (file().exists) await file().copy(new File(Paths.document, 'crumbs-state-v1.bak'), { overwrite: true });
    await temporary.move(file(), { overwrite: true });
  },
};
