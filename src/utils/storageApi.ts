import type { CompInputs } from '../engine/types';

const STORAGE_KEY = 'tc-flow:inputs';

export class StorageAPI {
  static save(inputs: CompInputs): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
    } catch {
      // Storage full or unavailable — silently ignore
    }
  }

  static load(): CompInputs | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Validate it has at least one expected key
      if (typeof parsed === 'object' && typeof parsed.baseSalary === 'number') {
        return parsed as CompInputs;
      }
      return null;
    } catch {
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
