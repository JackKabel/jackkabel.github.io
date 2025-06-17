import {signal, WritableSignal} from '@angular/core';

export enum IonicColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
  Light = 'light',
  Medium = 'medium',
  Dark = 'dark'
}

export const themeColor: WritableSignal<IonicColor> = signal(IonicColor.Primary);

export enum IonicTheme {
  Light = 'light',
  Dark = 'dark',
  System = 'system'
}
