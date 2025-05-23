import { Routes } from '@angular/router';
import { PizzasComponent } from './pizzas/pizzas.component';

// Wanted to simulate routing so i made the homepage to redirect to /pizzas path
export const routes: Routes = [
    {
        path: 'pizzas',
        component: PizzasComponent
    },
    {
        path: '', 
        redirectTo: '/pizzas',
        pathMatch: 'full'
    }
];
