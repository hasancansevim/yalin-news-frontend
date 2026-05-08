import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'news/:slug',
    loadComponent: () =>
      import('./features/news-detail/news-detail.component').then((m) => m.NewsDetailComponent),
  },
  {
    path: 'news-detail',
    redirectTo: 'news/preview',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.component').then((m) => m.AdminComponent),
  },
  {
    path: '500',
    loadComponent: () =>
      import('./features/errors/server-error/server-error.component').then((m) => m.ServerErrorComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/errors/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
