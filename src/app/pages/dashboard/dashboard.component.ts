import {Component, computed, ElementRef, inject, signal, ViewChild} from '@angular/core';
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
  IonLoading,
  IonPopover,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonToolbar,
  LoadingController,
  ModalController,
  RefresherCustomEvent,
  ToastController,
  ViewWillEnter
} from '@ionic/angular/standalone';
import {CommonModule, DatePipe, KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import {WorkEntryService} from '../../core/work-entry.service';
import {FormsModule} from '@angular/forms';
import {WorkFlow} from '../../models/work-flow.model';
import {WorkEntry} from '../../models/work-entry.model';
import {AddNewEntryModalComponent} from '../../features/add-new-entry-modal/add-new-entry-modal.component';
import {AddNewFlowModalComponent} from '../../features/add-new-flow-modal/add-new-flow-modal.component';
import {AnalyticService} from '../../core/analytic.service';
import {ChartComponent} from '../../shared/chart/chart.component';
import {themeColor} from '../../models/theme-color.model';
import {Gesture, GestureController} from '@ionic/angular';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonPopover,
    ChartComponent,
  ]
})
export class DashboardComponent implements ViewWillEnter {
  @ViewChild(IonContent) content!: IonContent;
  @ViewChild('monthAccordionGroup') monthAccordionGroup!: IonAccordionGroup;
  @ViewChild('swipeArea', {static: false}) swipeArea!: ElementRef;
  flows = signal<WorkFlow[]>([]);
  entries = signal<WorkEntry[]>([]);
  selectedFlowId = signal<string>('Main');
  isLoading = signal<boolean>(true);
  activeFlow = computed(() =>
    this.flows().find(f => f.id === this.selectedFlowId())
  );
  chartData = computed(() => {
    return this.entries().filter(e => e.flowId === this.selectedFlowId());
  })
  themeColor = themeColor;
  chartResolution = signal<any>(7);
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
  gestureDone = signal({show: false, direction: ''});
  private workService = inject(WorkEntryService);
  private modalController = inject(ModalController);
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private analytics = inject(AnalyticService);
  private gestureCtrl = inject(GestureController);
  private gesture?: Gesture;

  public reverseKeyValue = (a: any, b: any) => {
    return b.key.localeCompare(a.key);
  };

  async ionViewWillEnter() {
    await this.initializeData();
    setTimeout(() => this.setGesture(), 0);
  }

  setGesture() {
    this.gesture?.destroy();

    this.gesture = this.gestureCtrl.create({
      el: this.swipeArea.nativeElement,
      gestureName: 'flow-swipe',
      threshold: 10,
      onEnd: ev => {
        if (ev.deltaX > 50) {
          this.prevFlow();
        } else if (ev.deltaX < -50) {
          this.nextFlow();
        }
      }
    });
    this.gesture.enable();
  }

  prevFlow() {
    this.animate('right');
    this.selectedFlowId.update((current) => {
      const index = this.flows().findIndex(f => f.id === current);
      return this.flows()[index - 1]?.id || this.flows()[this.flows().length - 1].id
    })
  }

  nextFlow() {
    this.animate('left');
    this.selectedFlowId.update((current) => {
      const index = this.flows().findIndex(f => f.id === current);
      return this.flows()[index + 1]?.id || this.flows()[0].id
    })
  }

  animate(direction: 'left' | 'right') {
    this.gestureDone.update(() => {
      return {show: true, direction: direction}
    });
    setTimeout(() => this.gestureDone.set({show: false, direction: ''}), 500);
  }

  onFlowChange(event: any) {
    this.selectedFlowId.set(event.detail.value);
  }

  async editEntry(entry: WorkEntry) {
    this.analytics.event('edit_entry', 'entry_interaction', 'Pressed Edit Entry Button');

    const modal = await this.modalController.create({
      component: AddNewEntryModalComponent,
      componentProps: {flowId: this.selectedFlowId(), oldEntry: entry},
      breakpoints: [0, .5, 1],
      initialBreakpoint: 1
    });
    await modal.present();

    modal.onWillDismiss().then((result) => {
      if (result.role === 'saved') {
        this.handleRefresh();
      }
    })
  }

  async deleteEntry(entry: WorkEntry, notification: boolean) {
    this.analytics.event('delete_entry', 'entry_interaction', 'Pressed Delete Entry Button');
    try {
      await this.workService.deleteEntry(entry.id);
      if (notification) {
        void this.presentToast('Entry deleted successfully', 'success');
        void this.handleRefresh()
      }
    } catch (error) {
      void this.presentToast('Error deleting entry', 'danger');
    }
  }

  async editFlow() {
    this.analytics.event('edit_flow', 'flow_interaction', 'Pressed Edit Flow Button');

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
    this.analytics.event('delete_flow', 'flow_interaction', 'Pressed Delete Flow Button');

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
    this.analytics.event('add_entry', 'entry_interaction', 'Pressed Add Entry Button');

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
    this.analytics.event('add_flow', 'flow_interaction', 'Pressed Add Flow Button');

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

  onSegmentChange(event: any) {
    this.chartResolution.set(Number(event.detail.value));
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
      this.monthAccordionGroup.value = undefined;
    }
  }
}
