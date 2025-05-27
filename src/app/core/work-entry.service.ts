import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';

export interface WorkEntry {
  date: string;
  hours: number;
  note?: string;
}

const STORAGE_KEY = 'work-entries';

@Injectable({ providedIn: 'root' })
export class WorkEntryService {
  private _storage: Storage | null = null;
  private ready: Promise<void>;

  constructor(private storage: Storage) {
    this.ready = this.init();
  }

  async init() {
    this._storage = await this.storage.create();
  }

  async getEntries(): Promise<WorkEntry[]> {
    await this.ready; // waiting for init
    return (await this._storage?.get(STORAGE_KEY)) || [];
  }

  async addEntry(entry: WorkEntry): Promise<void> {
    await this.ready;
    const entries = await this.getEntries();
    entries.push(entry);
    await this._storage?.set(STORAGE_KEY, entries);
  }

  async clearAll(): Promise<void> {
    await this.ready;
    await this._storage?.remove(STORAGE_KEY);
  }
}
