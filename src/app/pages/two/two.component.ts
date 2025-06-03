import {ChangeDetectorRef, Component, signal, WritableSignal} from '@angular/core';
import {
  IonAccordion,
  IonAccordionGroup,
  IonChip,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonText,
  ViewWillEnter
} from '@ionic/angular/standalone';
import {DatePipe, KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import {WorkEntry, WorkEntryService} from '../../core/work-entry.service';

@Component({
  selector: 'app-two',
  templateUrl: './two.component.html',
  styleUrls: ['./two.component.scss'],
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
    IonChip
  ]
})
export class TwoComponent implements ViewWillEnter {
  groupedEntries: WritableSignal<Map<string, WorkEntry[]>> = signal(new Map());

  constructor(private service: WorkEntryService, private cdr: ChangeDetectorRef) {
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

    // Sort entries in each group by date (descending)
    for (const [key, list] of groups.entries()) {
      list.sort((b, a) => b.date.localeCompare(a.date));
    }

    // Sort groups by month descending
    const sortedGroups = new Map(
      Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a))
    );

    this.groupedEntries.set(sortedGroups);
    this.cdr.detectChanges();
  }

  calcTotal(group: any[]) {
    return group.reduce((a, b) => a + b.hours, 0)
  }
}
