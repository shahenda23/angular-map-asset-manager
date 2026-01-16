import { Routes } from '@angular/router';
import { MapComponent } from './components/map/map';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: LoginComponent },
    { 
        path: 'map', 
        component: MapComponent,
        canActivate: [authGuard]},
    { path: 'register', component: RegisterComponent },
    {path: '**', redirectTo: ''}
];
