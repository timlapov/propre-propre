import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {ClientService} from "../../services/client.service";
import {ICity, IGender} from "../../services/entities";
import {SupportService} from "../../services/support.service";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  registerForm: FormGroup;
  cities: ICity[] = [];
  genders: IGender[] = [];

  supportService = inject(SupportService);

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      birthdate: [null, Validators.required],
      address: ['', Validators.required],
      city: [null, Validators.required],
      gender: [null, Validators.required]
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
        ['ROLE_USER'], // предполагаем, что новые пользователи получают роль ROLE_USER
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
          // Здесь вы можете добавить логику для перенаправления пользователя или отображения сообщения об успехе
        },
        (error) => {
          console.error('Ошибка при регистрации:', error);
          // Здесь вы можете добавить логику для отображения сообщения об ошибке
        }
      );
    }
  }
}
