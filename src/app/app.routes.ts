import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "./login/login.component";
import {ServicesComponent} from "./services/services.component";
import {ClientProfileComponent} from "./client-profile/client-profile.component";
import {authGuard} from "../services/guards/auth.guard";
import {RegistrationComponent} from "./registration/registration.component";

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'client/profile', component: ClientProfileComponent, canActivate: [authGuard] },
  { path: 'client/registration', component: RegistrationComponent },
];
