import {Injectable, isDevMode} from '@angular/core';
declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticService {
  constructor() {}

  /**
   * Send a custom GA4 event
   * @param action Name of the event (e.g. 'start_timer')
   * @param category Logical group of the event (e.g. 'interaction')
   * @param label More detail (e.g. 'Start Timer Button Clicked')
   * @param value Numeric value associated with the event (optional)
   */
  public event(action: string, category: string, label: string = '', value?: number): void {
    if (isDevMode()) return; // Skip in dev mode

    if (typeof gtag === 'function') {
      gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    } else {
      console.warn('gtag function not available. Is GA4 script loaded?');
    }
  }
}
