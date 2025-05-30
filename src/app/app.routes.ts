import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    children: [
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/one/one.component').then(m => m.OneComponent),
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
