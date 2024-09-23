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
import {Error404Component} from "./error404/error404.component";
import {roleGuard} from "../services/guards/role.guard";
import {AuthService} from "../services/auth.service";
import {servicesGuard} from "../services/guards/services.guard";
import {PasswordResetComponent} from "./password-reset/password-reset.component";

export const routes: Routes = [
  { path: '', component: LayoutComponent,
  children: [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'services', component: ServicesComponent, canActivate: [servicesGuard] },
    { path: 'client/profile', component: ClientProfileComponent, canActivate: [roleGuard], data: { requiredRole: 'ROLE_USER' }  },
    { path: 'client/registration', component: RegistrationComponent },
    { path: 'client/reset-password', component: PasswordResetComponent },
    { path: 'employee/dashboard', component: EmployeeDashboardComponent, canActivate: [roleGuard], data: { requiredRole: 'ROLE_EMPLOYEE' } },
    { path: 'contact', component: ContactComponent},
    { path: '**', component: Error404Component},
  ]}
];
