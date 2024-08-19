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
  imports: [ReactiveFormsModule, FormsModule, ReactiveFormsModule, CommonModule, ToastrModule,],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;
  cities: ICity[] = [];
  genders: IGender[] = [];

  supportService = inject(SupportService);
  clientService = inject(ClientService);
  toastr = inject(ToastrService);

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
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
    this.supportService.getAllCities().subscribe(cities => this.cities = cities);
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
          console.log('Пользователь успешно зарегистрирован:', newClient);
          this.toastr.success('Vous pouvez maintenant vous connecter.', 'Vous avez été enregistré avec succès ! ',
            {
              timeOut: 3500,
              progressBar: true,
            }
            );
          setTimeout(() => {
            this.router.navigate(['/login']);
          });
        },
        (error) => {
          console.error('Ошибка при регистрации:', error);
          this.toastr.error('Un utilisateur ayant cette adresse électronique a déjà été enregistré. ', 'Erreur d\'inscription');
        }
      );
    }
  }

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
