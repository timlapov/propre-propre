import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {ServicesComponent} from "./services/services.component";
import {ClientProfileComponent} from "./client-profile/client-profile.component";
import {authGuard} from "../services/guards/auth.guard";
import {RegistrationComponent} from "./registration/registration.component";
import {LayoutComponent} from "./layout/layout.component";
import {EmployeeDashboardComponent} from "./employee-dashboard/employee-dashboard.component";
import {ContactComponent} from "./contact/contact.component";

export const routes: Routes = [
  { path: '', component: LayoutComponent,
  children: [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'services', component: ServicesComponent },
    { path: 'client/profile', component: ClientProfileComponent, canActivate: [authGuard] },
    { path: 'client/registration', component: RegistrationComponent },
    { path: 'employee/dashboard', component: EmployeeDashboardComponent, canActivate: [authGuard]},
    { path: 'contact', component: ContactComponent}
  ]}
];
