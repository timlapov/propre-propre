import {Component, inject} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterLink,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    message: ''
  };

  consent: boolean = false;
  isSending = false;
  emailSent = false;
  emailError = false;

  toastr = inject(ToastrService);

  sendEmail(form: any) {
    if (form.invalid || !this.consent) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires et accepter la politique de confidentialité.', 'Erreur');
      return;
    }

    this.isSending = true;
    emailjs.send(
      'service_augkxsc',
      'template_8jjlvur',
      this.formData,
      'M8xk45izLg6PCP8nU'
    )
      .then((result: EmailJSResponseStatus) => {
        this.isSending = false;
        this.emailSent = true;
        this.emailError = false;
        form.resetForm();
        this.toastr.success('Votre message a été envoyé avec succès !', 'Success', {
          timeOut: 3500,
          progressBar: true,
        });
      }, (error) => {
        this.isSending = false;
        this.emailSent = false;
        this.emailError = true;
        this.toastr.error('Une erreur s\'est produite lors de l\'envoi d\'un message. Veuillez réessayer plus tard.', 'Erreur', {
          timeOut: 3500,
          progressBar: true,
        });
      });
  }
}
