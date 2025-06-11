import {ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideIonicAngular} from '@ionic/angular/standalone';
import {registerIcons} from './core/icons';
import {IonicStorageModule} from '@ionic/storage-angular';
import {provideServiceWorker} from '@angular/service-worker';
import {AddNewFlowModalComponent} from './features/add-new-flow-modal/add-new-flow-modal.component';
import {AddNewEntryModalComponent} from './features/add-new-entry-modal/add-new-entry-modal.component';

registerIcons();

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideIonicAngular({}),
    importProvidersFrom(
      IonicStorageModule.forRoot(),
      AddNewEntryModalComponent,
      AddNewFlowModalComponent
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ]
};
