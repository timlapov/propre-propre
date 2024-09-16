import {Component, inject} from '@angular/core';
import {ToastrService} from "ngx-toastr";
import emailjs, { type EmailJSResponseStatus } from '@emailjs/browser';
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    phoneNumber: '',
    message: ''
  };

  isSending = false;
  emailSent = false;
  emailError = false;

  toastr = inject(ToastrService);

  sendEmail(form: any) {
    if (form.invalid) {
      this.toastr.error('Veuillez remplir tous les champs obligatoires', 'Erreur');
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
        console.log(result.text);
        this.isSending = false;
        this.emailSent = true;
        this.emailError = false;
        form.resetForm();
        this.toastr.success('Votre message a été envoyé avec succès !', 'Success', {
          timeOut: 3500,
          progressBar: true,
        });
      }, (error) => {
        console.error(error.text);
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
