import {Component} from '@angular/core';
import {IonIcon, IonTabBar, IonTabButton, IonTabs} from '@ionic/angular/standalone';
import {StandaloneService} from '../../core/standalone.service';
import {themeColor} from "../../models/theme-color.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,

  ]
})
export class HomeComponent {

  isStandalone = false;
  protected readonly themeColor = themeColor;

  constructor(protected standaloneService: StandaloneService) {
    this.isStandalone = this.standaloneService.isStandalone;
  }
}
