import {Component, inject} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router, RouterLink} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ICredentials, IToken} from "../../services/auth";
import {Observable} from "rxjs";
import {environment} from "../../environments/environment";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  service = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);

  public form: FormGroup = new FormGroup(
    {
      email: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required)
    }
  )

  login() {
    const credentials: ICredentials = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value
    };

    this.service.login(credentials).subscribe({
      next: () => {
        // Retrieve user information from the token
        const decodedToken = this.service.getCurrentUser();

        if (decodedToken) {
          // Redirect the user based on their role
          if (decodedToken.roles.includes('ROLE_ADMIN')) {
            window.location.href = `${environment.apiUrl}admin`;
          } else if (decodedToken.roles.includes('ROLE_EMPLOYEE')) {
            this.toastr.success('Bonne continuation', 'Vous avez été connecté avec succès !', {
              timeOut: 3500,
              progressBar: true,
            });
            this.router.navigate(['/employee/dashboard']);
          } else {
            this.toastr.success('Bonne continuation', 'Vous avez été connecté avec succès !', {
              timeOut: 3500,
              progressBar: true,
            });
            this.router.navigate(['/client/profile']);
          }
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.toastr.error('Veuillez réessayer', 'Erreur de saisie');
      }
    });
  }

}
