import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StandaloneService {
  isStandalone = false;
  constructor() {
    this.isStandalone = !!(('standalone' in navigator) && (navigator['standalone']));
  }
}
