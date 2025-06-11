import {Component} from '@angular/core';
import {IonBadge, IonIcon, IonTabBar, IonTabButton, IonTabs} from '@ionic/angular/standalone';
import {NgIf} from '@angular/common';
import {StandaloneService} from '../../core/standalone.service';
import {AddNewEntryModalComponent} from '../../features/add-new-entry-modal/add-new-entry-modal.component';
import {AddNewFlowModalComponent} from '../../features/add-new-flow-modal/add-new-flow-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonBadge,
    NgIf,
    AddNewEntryModalComponent,
    AddNewFlowModalComponent
  ]
})
export class HomeComponent {

  isStandalone = false;

  constructor(protected standaloneService: StandaloneService) {
    this.isStandalone = this.standaloneService.isStandalone;
  }
}
