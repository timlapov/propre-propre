import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ClientService} from "../../services/client.service";
import {ICity, IGender} from "../../services/entities";
import {SupportService} from "../../services/support.service";
import {CommonModule} from "@angular/common";
import {Router} from "@angular/router";
import {ToastrModule, ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, ToastrModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;
  cities: ICity[] = [];
  genders: IGender[] = [];

  // Injecting services using Angular's inject function
  supportService = inject(SupportService);
  clientService = inject(ClientService);
  toastr = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    // Initialize the registration form with validators
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      city: ['', Validators.required],
      address: ['', Validators.required],
      gender: [null],
      birthdate: [null]
    });
  }

  ngOnInit() {
    // Fetch list of cities
    this.supportService.getAllCities().subscribe(cities => this.cities = cities);
    // Fetch list of genders
    this.supportService.getAllGenders().subscribe(genders => this.genders = genders);
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formValue = this.registerForm.value;
      this.clientService.addClient(
        formValue.email,
        formValue.name,
        formValue.surname,
        formValue.birthdate,
        formValue.address,
        formValue.city,
        formValue.gender,
        formValue.password
      ).subscribe(
        (newClient) => {
          this.toastr.success('Vous pouvez maintenant vous connecter.', 'Vous avez été enregistré avec succès ! ',
            {
              timeOut: 3500,
              progressBar: true,
            }
            );
          // Navigate after toast message disappears
          setTimeout(() => {
            this.router.navigate(['/login']);
          });
        },
        (error) => {
          this.toastr.error('Un utilisateur ayant cette adresse électronique a déjà été enregistré. ', 'Erreur d\'inscription',
            {
              timeOut: 500,
              progressBar: true,
            });
        }
      );
    } else {
      // Mark all fields as touched to display validation errors
      this.registerForm.markAllAsTouched();
      this.toastr.error('Veuillez corriger les erreurs du formulaire.', 'Erreur de validation',
        {
          timeOut: 3500,
          progressBar: true,
        });
    }
  }

  // Checks if all required fields are valid to enable the submit button
  get requiredFieldsValid(): boolean {
    const form = this.registerForm;
    return !!form &&
      !!form.get('email')?.valid &&
      !!form.get('password')?.valid &&
      !!form.get('name')?.valid &&
      !!form.get('surname')?.valid &&
      !!form.get('city')?.valid &&
      !!form.get('address')?.valid;
  }
}
