import {Component, OnInit} from '@angular/core';
import {IonIcon, IonTabBar, IonTabButton, IonTabs} from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon
  ]
})
export class HomeComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

}
