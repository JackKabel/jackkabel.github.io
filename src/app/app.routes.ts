import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home/add',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home.component').then(m => m.HomeComponent),
    children: [
      {
        path: 'add',
        loadComponent: () =>
          import('./pages/one/one.component').then(m => m.OneComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/two/two.component').then(m => m.TwoComponent),
      },
    ]
  },
];
