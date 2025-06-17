import { Injectable } from '@angular/core';
import {IonicColor, IonicTheme, themeColor} from '../models/theme-color.model';

const THEME_STORAGE_KEY = 'theme-preference';
const THEME_COLOR_STORAGE_KEY = 'theme-color';

@Injectable({
  providedIn: 'root'
})
export class ThemeColorService {
  private prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.applyStoredTheme();
    this.applyStoredColor();

    this.prefersDark.addEventListener('change', (event) => {
      const stored = this.getStoredTheme();
      if (stored === IonicTheme.System) {
        this.applyDarkClass(event.matches);
      }
    });
  }

  applyStoredColor() {
    const color = this.getStoredColor();
    this.setColor(color);
  }

  applyStoredTheme() {
    const theme = this.getStoredTheme();
    this.setTheme(theme);
  }

  getStoredColor(): IonicColor {
    return (localStorage.getItem(THEME_COLOR_STORAGE_KEY) as IonicColor) || IonicColor.Primary;
  }

  getStoredTheme(): IonicTheme {
    return (localStorage.getItem(THEME_STORAGE_KEY) as IonicTheme) || IonicTheme.System;
  }

  setColor(color: IonicColor | string) {
    themeColor.set(color as IonicColor);
    localStorage.setItem(THEME_COLOR_STORAGE_KEY, color);
  }

  setTheme(theme: IonicTheme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme === IonicTheme.System) {
      this.applyDarkClass(this.prefersDark.matches);
    } else {
      this.applyDarkClass(theme === IonicTheme.Dark);
    }
  }

  private applyDarkClass(shouldAdd: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', shouldAdd);
  }
}
