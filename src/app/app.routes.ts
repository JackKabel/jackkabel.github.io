import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {AboutComponent} from './pages/about/about.component';
import {ModalController} from '@ionic/angular';
import {AddNewEntryModalComponent} from './features/add-new-entry-modal/add-new-entry-modal.component';
import {AddNewFlowModalComponent} from './features/add-new-flow-modal/add-new-flow-modal.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/about',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'dashboard',
        providers: [ModalController, AddNewEntryModalComponent, AddNewFlowModalComponent],
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(m => m.SettingsComponent),
      },
    ]
  },
];
