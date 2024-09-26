import {Component, EventEmitter, Output, inject, ElementRef, ViewChild, AfterViewInit} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ClientService } from "../../services/client.service";
import { ToastrService } from "ngx-toastr";
import { CommonModule } from '@angular/common';
import { Modal } from "bootstrap";

@Component({
  selector: 'app-password-reset-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-reset-modal.component.html',
  styleUrls: ['./password-reset-modal.component.css']
})
export class PasswordResetModalComponent implements AfterViewInit {
  @Output() passwordResetRequested = new EventEmitter<void>();

  resetPasswordForm: FormGroup;
  isSubmitting: boolean = false;

  // Reference to the modal element
  @ViewChild('passwordResetModal') passwordResetModal!: ElementRef;
  private modalInstance!: Modal;

  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private toastr = inject(ToastrService);

  constructor() {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // Initialize the modal instance
  ngAfterViewInit(): void {
    this.modalInstance = new Modal(this.passwordResetModal.nativeElement, {
      backdrop: 'static',
      keyboard: false
    });
  }

  open() {
    this.modalInstance.show();
  }

  close() {
    this.modalInstance.hide();
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;

    const email = this.resetPasswordForm.value.email;

    this.clientService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.toastr.success(response.message || 'Un e-mail de réinitialisation a été envoyé.', 'Succès', {
          timeOut: 3500,
          progressBar: true,
        });
        this.isSubmitting = false;
        this.close();
        this.passwordResetRequested.emit();
      },
      error: (error) => {
        this.isSubmitting = false;
        // Handle the case when the user doesn't exist
        this.toastr.error(error.error.message || 'Une erreur est survenue lors de la demande de réinitialisation du mot de passe.', 'Erreur', {
          timeOut: 5000,
          progressBar: true
        });
      }
    });
  }

}
