import {Component, inject} from '@angular/core';
import {IonIcon, IonText} from '@ionic/angular/standalone';
import {FormsModule} from '@angular/forms';
import {KeyValuePipe, NgForOf, NgIf} from '@angular/common';
import {ThemeColorService} from '../../core/theme-color.service';
import {IonicColor, IonicTheme, themeColor} from '../../models/theme-color.model';

@Component({
  selector: 'app-theme-and-color',
  templateUrl: './theme-and-color.component.html',
  styleUrls: ['./theme-and-color.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    IonIcon,
    NgIf,
    KeyValuePipe,
    IonText
  ]
})
export class ThemeAndColorComponent {
  themeService = inject(ThemeColorService);

  selectedTheme: IonicTheme = this.themeService.getStoredTheme();
  selectedColor: IonicColor = this.themeService.getStoredColor();

  readonly IonicTheme = IonicTheme;
  readonly IonicColorOptions = Object.entries(IonicColor)
    .filter(([key, value]) => value !== IonicColor.Light && value !== IonicColor.Medium)
    .map(([key, value]) => ({key, value}));
  protected readonly themeColor = themeColor;

  selectTheme(theme: IonicTheme) {
    this.selectedTheme = theme;
    this.themeService.setTheme(theme);
  }

  selectColor(color: IonicColor | string) {
    this.selectedColor = color as IonicColor;
    this.themeService.setColor(color);
  }
}
