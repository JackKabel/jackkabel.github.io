import {Routes} from '@angular/router';
import {HomeComponent} from './pages/home/home.component';
import {OneComponent} from './pages/one/one.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      {
        path: 'about',
        component: OneComponent,
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/two/two.component').then(m => m.TwoComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.component').then(m => m.SettingsComponent),
      },
    ]
  },
];
