import {Component, computed, inject, signal} from '@angular/core';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonDatetime,
  IonFab,
  IonFabButton,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading,
  IonModal,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
  ViewWillEnter
} from '@ionic/angular/standalone';
import {DatePipe, KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import {WorkEntryService} from '../../core/work-entry.service';
import {FormsModule} from '@angular/forms';
import {WorkFlow} from '../../models/work-flow.model';
import {WorkEntry} from '../../models/work-entry.model';
import {LoadingController, ModalController, RefresherCustomEvent} from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonItem,
    IonList,
    IonLabel,
    NgIf,
    NgForOf,
    IonText,
    DatePipe,
    KeyValuePipe,
    IonAccordion,
    IonAccordionGroup,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonIcon,
    IonModal,
    IonDatetime,
    IonInput,
    FormsModule,
    IonFooter,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonBadge,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonFab,
    IonFabButton,
    IonTextarea,
    IonToast,
    IonLoading,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent
  ]
})
export class DashboardComponent implements ViewWillEnter {

  flows = signal<WorkFlow[]>([]);
  entries = signal<WorkEntry[]>([]);
  selectedFlowId = signal<string>('-1');
  expandedMonth = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  showSuccessToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastColor = signal<string>('success');
  // Computed values
  activeFlow = computed(() =>
    this.flows().find(f => f.id === this.selectedFlowId())
  );
  // Form data
  newEntry: Partial<WorkEntry> = {
    flowId: this.selectedFlowId(),
    date: new Date().toISOString(),
    hours: 8
  };
  newFlow: Partial<WorkFlow> = {};
  maxDate = new Date().toISOString();
  monthlyEntries = computed(() => {
    const flow = this.activeFlow();
    if (!flow) return new Map();
    const entries = flow.id
      ? this.entries().filter(e => e.flowId === flow.id)
      : this.entries();

    const grouped = new Map<string, WorkEntry[]>();

    entries.forEach(entry => {
      const monthKey = entry.date.substring(0, 7); // YYYY-MM
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(entry);
    });
    return grouped;
  });
  scrollY = 0;
  isModalOpen = false;
  // Inject services
  private workService = inject(WorkEntryService);
  private modalController = inject(ModalController);
  private loadingController = inject(LoadingController);

  get hideHeader() {
    return this.scrollY > 150; // toggle content visibility
  }

  onScroll(event: CustomEvent) {
    this.scrollY = event.detail.scrollTop;
  }

  async ionViewWillEnter() {
    await this.initializeData();
  }

  onFlowChange(event: any) {
    this.selectedFlowId.set(event.detail.value);
    this.expandedMonth.set(null);
    this.resetEntryForm();
  }

  async saveEntry() {
    if (!this.isFormValid()) return;

    try {
      this.expandedMonth.set(null);
      const entryData = {
        id: Date.now().toString(),
        flowId: this.newEntry.flowId!,
        date: this.newEntry.date!.split('T')[0], // Convert to YYYY-MM-DD
        hours: Number(this.newEntry.hours!),
        note: this.newEntry.note?.trim() || undefined
      };

      await this.workService.addEntry(entryData);
      this.showToast('Entry saved successfully');
      this.resetEntryForm();
      await this.dismissModal('add-entry');

    } catch (error) {
      console.error('Error saving entry:', error);
      this.showToast('Error saving entry', 'danger');
    } finally {
      await this.initializeData();
    }
  }

  async editEntry(entry: WorkEntry) {
    // Pre-fill form with entry data
    this.newEntry = {
      flowId: entry.flowId,
      date: entry.date,
      hours: entry.hours,
      note: entry.note
    };

    // Delete old entry (we'll create a new one)
    await this.deleteEntry(entry, false);

    // Open modal for editing
    const modal = await this.modalController.create({
      component: 'add-entry', // This would reference your modal
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75, 1]
    });

    await modal.present();
  }

  // === ENTRY MANAGEMENT ===

  async deleteEntry(entry: WorkEntry, showToast = true) {
    try {
      await this.workService.deleteEntry(entry.id);
      if (showToast) {
        this.showToast('Entry deleted');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      this.showToast('Error deleting entry', 'danger');
    }
  }

  async saveFlow() {
    if (!this.isFlowFormValid()) return;

    try {
      const flowData = {
        id: this.newFlow.name!.trim(),
        name: this.newFlow.name!.trim(),
        description: this.newFlow.description?.trim(),
      };

      await this.workService.addFlow(flowData);
      this.showToast(`Flow "${flowData.name}" created successfully`);
      await this.dismissModal('add-flow-trigger');
    } catch (error) {
      console.error('Error saving flow:', error);
      this.showToast('Error creating flow', 'danger');
    }
  }

  // === UTILITY METHODS ===

  getTotalHoursForMonth(entries: WorkEntry[]): number {
    return entries.reduce((sum, entry) => sum + entry.hours, 0);
  }

  isWeekend(dateString: string): boolean {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  trackByEntry(index: number, entry: WorkEntry): string {
    return entry.id;
  }

  isFormValid(): boolean {
    return !!(
      this.newEntry.flowId &&
      this.newEntry.date &&
      this.newEntry.hours &&
      this.newEntry.hours > 0
    );
  }

  isFlowFormValid(): boolean {
    return true;
  }

  resetEntryForm() {
    this.newEntry = {
      flowId: this.selectedFlowId(),
      date: new Date().toISOString(),
      hours: 8
    };
  }

  // === FORM RESET ===

  presentModal(modal: IonModal) {
    this.isModalOpen = true;
  }

  async dismissModal(trigger: string) {
    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss();
    }
  }

  async handleRefresh(event: RefresherCustomEvent) {
    try {
      await this.initializeData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      await event.target.complete();
    }
  }

  // === MODAL MANAGEMENT ===

  private async initializeData() {
    const loading = await this.loadingController.create({
      message: 'Loading flows...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const [flows, entries] = await Promise.all([
        this.workService.getFlows(),
        this.workService.getEntries()
      ]);

      this.flows.set(flows);
      this.entries.set(entries);
    } catch (error) {
      console.error('Error initializing data:', error);
      this.showToast('Error loading data', 'danger');
    } finally {
      await loading.dismiss();
      this.isLoading.set(false);
    }
  }

  private showToast(message: string, color: string = 'success') {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.showSuccessToast.set(true);
  }
}
