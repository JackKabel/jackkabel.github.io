import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import {WorkEntry} from '../models/work-entry.model';
import {WorkFlow} from '../models/work-flow.model';

const ENTRIES_STORAGE_KEY = 'work-entries';
const FLOWS_STORAGE_KEY = 'work-flows';

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
    await this.ready;
    return (await this._storage?.get(ENTRIES_STORAGE_KEY)) || [];
  }

  async addEntry(entry: WorkEntry): Promise<void> {
    await this.ready;
    const entries = await this.getEntries();
    entries.push(entry);
    await this._storage?.set(ENTRIES_STORAGE_KEY, entries);
  }

  async updateEntry(entry: WorkEntry): Promise<void> {
    await this.ready;
    const entries = await this.getEntries();
    const updatedEntries = entries.map(e => e.id === entry.id ? entry : e);
    await this._storage?.set(ENTRIES_STORAGE_KEY, updatedEntries);
  }

  async deleteEntry(entryId: string): Promise<void> {
    await this.ready;
    const entries = await this.getEntries();
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    await this._storage?.set(ENTRIES_STORAGE_KEY, updatedEntries);
  }

  async getFlows(): Promise<WorkFlow[]> {
    await this.ready;
    return (await this._storage?.get(FLOWS_STORAGE_KEY)) || [];
  }

  async addFlow(flow: WorkFlow): Promise<void> {
    await this.ready;
    const flows = await this.getFlows();
    flows.push(flow);
    await this._storage?.set(FLOWS_STORAGE_KEY, flows);
  }

  async updateFlow(flow: WorkFlow): Promise<void> {
    await this.ready;
    const flows = await this.getFlows();
    const updatedFlows = flows.map(f => f.id === flow.id ? flow : f);
    await this._storage?.set(FLOWS_STORAGE_KEY, updatedFlows);
  }

  async deleteFlow(flowId: string): Promise<void> {
    await this.ready;
    const flows = await this.getFlows();
    const updatedFlows = flows.filter(flow => flow.id !== flowId);
    await this._storage?.set(FLOWS_STORAGE_KEY, updatedFlows);
  }

  async clearAll(): Promise<void> {
    await this.ready;
    await this._storage?.remove(ENTRIES_STORAGE_KEY);
    await this._storage?.remove(FLOWS_STORAGE_KEY);
  }
}
