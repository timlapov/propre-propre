import {Component, inject, ViewChild} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {Router, RouterLink} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ICredentials, IToken} from "../../services/auth";
import {environment} from "../../environments/environment";
import {ToastrService} from "ngx-toastr";
import {PasswordResetModalComponent} from "../password-reset-modal/password-reset-modal.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PasswordResetModalComponent,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  service = inject(AuthService);
  router = inject(Router);
  toastr = inject(ToastrService);

  isSubmitting: boolean = false;

  @ViewChild(PasswordResetModalComponent) passwordResetModal!: PasswordResetModalComponent;

  public form: FormGroup = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required, Validators.minLength(8)])
  });

  login() {
    this.isSubmitting = true;
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
            this.isSubmitting = false;
            this.toastr.success('Bonne continuation', 'Vous avez été connecté avec succès !', {
              timeOut: 3500,
              progressBar: true,
            });
            this.router.navigate(['/employee/dashboard']);
          } else {
            this.isSubmitting = false;
            this.toastr.success('Bonne continuation', 'Vous avez été connecté avec succès !', {
              timeOut: 3500,
              progressBar: true,
            });
            this.router.navigate(['/client/profile']);
          }
        } else {
          // Handle case when decodedToken is null
          this.toastr.error('Erreur lors de la récupération des informations utilisateur.', 'Erreur');
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        this.toastr.error('Veuillez réessayer', 'Erreur de saisie');
        this.form.reset();
      }
    });
  }

  openPasswordResetModal() {
    if (this.passwordResetModal) {
      this.passwordResetModal.open();
    }
  }

}
