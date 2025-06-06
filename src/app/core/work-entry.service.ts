import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage-angular';
import {WorkEntry} from '../models/work-entry.model';
import {WorkFlow} from '../models/work-flow.model';

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
    await this.ready;
    return (await this._storage?.get(STORAGE_KEY)) || [];
  }

  async getEntriesByFlowId(flowId: string): Promise<WorkEntry[]> {
    await this.ready;
    const entries = await this.getEntries();
    return entries.filter(entry => entry.flowId === flowId);
  }

  async addEntry(entry: WorkEntry): Promise<void> {
    await this.ready;
    const entries = await this.getEntries();
    entries.push(entry);
    await this._storage?.set(STORAGE_KEY, entries);
  }

  async deleteEntry(entryId: string): Promise<void> {
    await this.ready;
    const entries = await this.getEntries();
    const updatedEntries = entries.filter(entry => entry.id !== entryId);
    await this._storage?.set(STORAGE_KEY, updatedEntries);
  }

  async getFlows(): Promise<WorkFlow[]> {
    await this.ready;
    return (await this._storage?.get('work-flows')) || [];
  }

  async addFlow(flow: WorkFlow): Promise<void> {
    await this.ready;
    const flows = await this.getFlows();
    flows.push(flow);
    await this._storage?.set('work-flows', flows);
  }

  async clearAll(): Promise<void> {
    await this.ready;
    await this._storage?.remove(STORAGE_KEY);
  }
}
