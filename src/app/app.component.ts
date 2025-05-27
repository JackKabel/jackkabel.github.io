import {Component} from '@angular/core';
import {IonApp, IonRouterOutlet} from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  imports: [IonRouterOutlet, IonApp],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'WorkR';
}
