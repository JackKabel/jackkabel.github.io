import {ChangeDetectorRef, Component, signal, ViewChild, WritableSignal} from '@angular/core';
import {
  IonAccordion,
  IonAccordionGroup, IonBackButton, IonButton, IonButtons,
  IonChip,
  IonContent, IonDatetime, IonFooter, IonHeader, IonIcon, IonInput,
  IonItem,
  IonLabel,
  IonList, IonModal, IonRefresher, IonRefresherContent,
  IonText, IonTitle, IonToast, IonToolbar,
  ViewWillEnter, ViewWillLeave
} from '@ionic/angular/standalone';
import {DatePipe, KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import {WorkEntry, WorkEntryService} from '../../core/work-entry.service';
import {FormsModule} from '@angular/forms';

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
    IonChip,
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
    IonToast,
    IonBackButton,
    IonButtons
  ]
})
export class DashboardComponent implements ViewWillEnter, ViewWillLeave {
  groupedEntries: WritableSignal<Map<string, WorkEntry[]>> = signal(new Map());
  activeGroup: WritableSignal<{month: string, entries: WorkEntry[]} | undefined> = signal(undefined);
  date: string = new Date().toISOString();
  hours: number = 8;
  note?: string;
  @ViewChild(IonModal) modal!: IonModal;
  isToastOpen = false;
  constructor(private service: WorkEntryService,
              private cdr: ChangeDetectorRef,
              private workEntryService: WorkEntryService) {
  }

  async ionViewWillEnter() {
    const entries = await this.service.getEntries();
    const groups = new Map<string, WorkEntry[]>();

    for (const entry of entries) {
      const date = new Date(entry.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    }

    for (const [key, list] of groups.entries()) {
      list.sort((b, a) => b.date.localeCompare(a.date));
    }

    const sortedGroups = new Map(
      Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a))
    );

    this.groupedEntries.set(sortedGroups);
    this.cdr.detectChanges();
  }

  ionViewWillLeave() {
    this.activeGroup.set(undefined);
  }

  calcTotal(group: WorkEntry[]) {
    return group.reduce((a, b) => a + b.hours, 0)
  }

  setActiveGroup($event: any) {
    let groupKey: string = $event.detail.value;
    if (groupKey) {
      let group = this.groupedEntries().get(groupKey);
      this.activeGroup.set({
        month: groupKey,
        entries: group!
      });
    } else {
     this.activeGroup.set(undefined);
    }
  }

  handleRefresh(event: CustomEvent) {
    setTimeout(() => {
      void this.ionViewWillEnter();
      void (event.target as HTMLIonRefresherElement).complete();
    }, 2000);
  }

  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  cancel() {
    void this.ionViewWillEnter();
    void this.modal.dismiss();
  }

  confirm() {
    void this.save();
    void this.modal.dismiss();
  }

  async save() {
    if (!this.date || !this.hours) return;

    await this.workEntryService.addEntry({
      date: this.date,
      hours: this.hours,
      note: this.note
    });

    this.date = new Date().toISOString();
    this.hours = 8;
    this.note = '';
    this.setOpen(true);
  }
}
