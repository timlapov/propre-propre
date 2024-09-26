import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ClientService} from "../../services/client.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ToastrService} from "ngx-toastr";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css'
})
export class PasswordResetComponent implements OnInit {
  resetPasswordForm: FormGroup;
  token: string = '';
  isSubmitting: boolean = false;

  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  constructor() {
    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.toastr.error('Le lien web n\'est pas valide', 'Erreur', {
          timeOut: 3500,
          progressBar: true
        });
        this.router.navigate(['/login']);
      }
    });
  }

  passwordsMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordsMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const password = this.resetPasswordForm.value.password;

    this.clientService.resetPassword(this.token, password).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Votre mot de passe a été réinitialisé.', 'Succès', {
          timeOut: 3500,
          progressBar: true,
        });
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error.error?.message || 'Une erreur est survenue lors de la réinitialisation du mot de passe.';
        this.toastr.error(errorMessage, 'Erreur', {
          timeOut: 5000,
          progressBar: true
        });
      }
    });
  }
}
