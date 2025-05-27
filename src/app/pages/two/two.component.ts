import {ChangeDetectorRef, Component} from '@angular/core';
import {WorkEntry, WorkEntryService} from '../../core/work-entry.service';
import {IonContent, IonItem, IonLabel, IonList, IonText, ViewWillEnter} from '@ionic/angular/standalone';
import {DatePipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-two',
  templateUrl: './two.component.html',
  styleUrls: ['./two.component.scss'],
  imports: [
    IonContent,
    IonItem,
    IonList,
    IonLabel,
    NgIf,
    NgForOf,
    DatePipe,
    IonText
  ]
})
export class TwoComponent implements ViewWillEnter {
  entries: WorkEntry[] = [];

  constructor(private service: WorkEntryService,
              private cdr: ChangeDetectorRef) {
  }

  async ionViewWillEnter() {
    this.entries = await this.service.getEntries()
    this.cdr.detectChanges();
  }
}
