import {AfterViewInit, Component, computed, ElementRef, inject, signal, ViewChild} from '@angular/core';
import {
  IonAccordion,
  IonAccordionGroup,
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonLoading, IonPopover,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToolbar, ToastController,
  ViewWillEnter
} from '@ionic/angular/standalone';
import {DatePipe, KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import {WorkEntryService} from '../../core/work-entry.service';
import {FormsModule} from '@angular/forms';
import {WorkFlow} from '../../models/work-flow.model';
import {WorkEntry} from '../../models/work-entry.model';
import {LoadingController, ModalController, RefresherCustomEvent} from '@ionic/angular';
import {AddNewEntryModalComponent} from '../../features/add-new-entry-modal/add-new-entry-modal.component';
import {AddNewFlowModalComponent} from '../../features/add-new-flow-modal/add-new-flow-modal.component';

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
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonIcon,
    FormsModule,
    IonSegment,
    IonSegmentButton,
    IonBadge,
    IonItemSliding,
    IonItemOptions,
    IonItemOption,
    IonLoading,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonPopover
  ]
})
export class DashboardComponent implements ViewWillEnter, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;

  flows = signal<WorkFlow[]>([]);
  entries = signal<WorkEntry[]>([]);
  selectedFlowId = signal<string>('Main');
  expandedMonth = signal<string | null>(null);
  isLoading = signal<boolean>(true);
  activeFlow = computed(() =>
    this.flows().find(f => f.id === this.selectedFlowId())
  );
  monthlyEntries = computed(() => {
    const flow = this.activeFlow();
    if (!flow) return new Map();
    const filteredEntries = flow.id
      ? this.entries().filter(e => e.flowId === flow.id)
      : this.entries();
    const grouped = new Map<string, WorkEntry[]>();
    filteredEntries.forEach(entry => {
      const monthKey = entry.date.substring(0, 7); // Extracts 'YYYY-MM'
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(entry);
    });
    grouped.forEach(entriesArray => {
      entriesArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return grouped;
  });
  @ViewChild('sentinel', { static: true }) sentinel!: ElementRef;
  @ViewChild('flowCard', { static: true }) flowCard!: ElementRef;
  isStuck = false;

  private workService = inject(WorkEntryService);
  private modalController = inject(ModalController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);


  public reverseKeyValue = (a: any, b: any) => {
    return b.key.localeCompare(a.key);
  };

  async ionViewWillEnter() {
    await this.initializeData();
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      ([entry]) => {
        this.isStuck = !entry.isIntersecting;
      },
      {
        root: null,
        threshold: [0]
      }
    );
    observer.observe(this.sentinel.nativeElement);
  }

  onFlowChange(event: any) {
    this.selectedFlowId.set(event.detail.value);
    this.expandedMonth.set(null);
  }

  async editEntry(entry: WorkEntry) {
    const modal = await this.modalController.create({
      component: AddNewEntryModalComponent,
      componentProps: {flowId: this.selectedFlowId(), oldEntry: entry},
      breakpoints: [0, .5, 1],
      initialBreakpoint: 1
    });
    await modal.present();

    modal.onWillDismiss().then((result) => {
      if (result.role === 'saved') {
        this.handleRefresh().then(() => {
          const current = this.expandedMonth();
          this.expandedMonth.set(null);
          setTimeout(() => this.expandedMonth.set(current), 0);
        });
      }
    })
  }

  async deleteEntry(entry: WorkEntry, notification: boolean) {
    try {
      await this.workService.deleteEntry(entry.id);
      if (notification) {
        void this.presentToast('Entry deleted successfully', 'success');
        void this.handleRefresh().then(() => {
          const current = this.expandedMonth();
          this.expandedMonth.set(null);
          setTimeout(() => this.expandedMonth.set(current), 0);
        });
      }
    } catch (error) {
      void this.presentToast('Error deleting entry', 'danger');
    }
  }

  async editFlow() {
    let flow = this.activeFlow();
    const modal = await this.modalController.create({
      component: AddNewFlowModalComponent,
      componentProps: {oldFlow: flow},
      breakpoints: [0, .5, 1],
      initialBreakpoint: 1
    });
    await modal.present();

    modal.onWillDismiss().then((result) => {
      if (result.role === 'saved') {
        this.handleRefresh()
      }
    })
  }

  async deleteFlow(notification: boolean) {
    try {
      await this.workService.deleteFlow(this.activeFlow()!.id);
      if (notification) {
        void this.presentToast('Flow deleted successfully', 'success');
      }
    } catch (error) {
      void this.presentToast('Error deleting flow', 'danger');
    } finally {
      void this.handleRefresh();
      this.selectedFlowId.set('Main');
    }
  }

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

  async presentEntryModal() {
    const modal = await this.modalController.create({
      component: AddNewEntryModalComponent,
      componentProps: {flowId: this.selectedFlowId()},
      breakpoints: [0, .5, 1],
      initialBreakpoint: 1
    });
    await modal.present();

    modal.onWillDismiss().then((result) => {
      if (result.role === 'saved') {
        this.handleRefresh()
      }
    })
  }

  async presentFlowModal() {
    const modal = await this.modalController.create({
      component: AddNewFlowModalComponent,
      breakpoints: [0, .5, 1],
      initialBreakpoint: 1
    });
    await modal.present();

    modal.onWillDismiss().then((result) => {
      if (result.role === 'saved') {
        this.handleRefresh()
      }
    })
  }

  async presentToast(message: string, color?: string, icon?: string) {
    const toast = await this.toastController.create({
      message: message,
      color: color ? color : undefined,
      icon: icon ? icon : undefined,
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }

  async handleRefresh(event?: RefresherCustomEvent) {
    try {
      await this.initializeData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      await event?.target.complete();
    }
  }

  private async initializeData() {
    this.isLoading.set(true);
    const loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const [flows, entries] = await Promise.all([
        this.workService.getFlows(),
        this.workService.getEntries()
      ]);
      if (flows.length === 0) {
        await this.workService.addFlow({
          id: 'Main',
          name: 'Main',
          description: 'Default flow'
        });
        const updatedFlows = await this.workService.getFlows();
        this.flows.set(updatedFlows);
      } else {
        this.flows.set(flows);
      }
      entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      this.entries.set(entries);

    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      await loading.dismiss();
      this.isLoading.set(false);
    }
  }
}
