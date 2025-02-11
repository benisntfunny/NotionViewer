import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  {
    path: '**', // Catch-all route
    component: AppComponent,
  },
];
