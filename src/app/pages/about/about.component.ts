import {Component} from '@angular/core';
import {IonBadge, IonContent, IonIcon, IonText} from '@ionic/angular/standalone';
import {FormsModule} from '@angular/forms';
import {themeColor} from '../../models/theme-color.model';


@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  imports: [
    IonContent,
    IonIcon,
    FormsModule,
    IonBadge,
    IonText
  ]
})
export class AboutComponent {
  protected readonly themeColor = themeColor;

  goTo() {
    window.open('https://www.linkedin.com/in/antal-t-abel/', '_blank');
  }
}

