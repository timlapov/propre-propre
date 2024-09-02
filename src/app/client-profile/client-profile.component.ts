import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {CommonModule, DatePipe, NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {ICity, IClient, IGender, IOrder} from "../../services/entities";
import {ClientService} from "../../services/client.service";
import {map, Observable, of} from "rxjs";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SupportService} from "../../services/support.service";
import { Modal } from 'bootstrap';
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
  ],
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.css'
})

export class ClientProfileComponent implements OnInit {
  authService = inject(AuthService);
  clientService = inject(ClientService);
  router = inject(Router);
  formBuilder = inject(FormBuilder);
  supportService = inject(SupportService);
  datePipe = inject(DatePipe);
  toastr = inject(ToastrService);

  clientJwt: any;
  $client: Observable<IClient> | undefined;
  client: IClient | undefined;

  showCompletedOrders: boolean = false;
  editProfileForm: FormGroup | undefined;
  cities: ICity[] = [];
  genders: IGender[] = [];
  changePassword: boolean = false;
  private editProfileModal: Modal | null = null;
  private formReady: boolean = false;


  ngOnInit() {
    this.supportService.getAllCities().subscribe(cities => this.cities = cities);
    this.supportService.getAllGenders().subscribe(genders => this.genders = genders);

    this.clientJwt = this.authService.getCurrentUser();
    if (this.clientJwt && this.clientJwt.id) {
      this.$client = this.clientService.getClientById(this.clientJwt.id);
      this.$client.subscribe(client => {
        this.initForm(client);
      });
    } else {
      console.error('No valid client JWT found');
      this.router.navigate(['/login']);
    }

    const modalElement = document.getElementById('editProfileModal');
    if (modalElement) {
      this.editProfileModal = new Modal(modalElement);
    }
  }

  initForm(client: IClient) {
    const formattedDate = this.datePipe.transform(client.birthdate, 'dd/MM/yyyy');

    this.editProfileForm = this.formBuilder.group({
      email: [{ value: client.email, disabled: true }],
      name: [client.name, Validators.required],
      surname: [client.surname, Validators.required],
      birthdate: [{ value: formattedDate, disabled: true }],
      city: [client.city, Validators.required],
      address: [client.address, Validators.required],
      gender: [client.gender],
      changePassword: [false],
      newPassword: ['', [Validators.minLength(8)]]
    });

    this.editProfileForm.get('changePassword')?.valueChanges.subscribe(value => {
      this.changePassword = value;
      if (value) {
        this.editProfileForm?.get('newPassword')?.setValidators([Validators.required, Validators.minLength(8)]);
      } else {
        this.editProfileForm?.get('newPassword')?.clearValidators();
        this.editProfileForm?.get('newPassword')?.setValue('');
      }
      this.editProfileForm?.get('newPassword')?.updateValueAndValidity();
    });

    this.formReady = true;
  }

  openEditModal() {
    if (this.formReady) {
      this.editProfileModal?.show();
    } else {
      console.error('Form is not ready yet');
    }
  }

  onSubmit() {
    if (this.editProfileForm && this.editProfileForm.valid && this.clientJwt) {
      const formValue = this.editProfileForm.getRawValue();
      const updatedClient: Partial<IClient> = {
        id: this.clientJwt.id,
        name: formValue.name,
        surname: formValue.surname,
        email: formValue.email,
        address: formValue.address,
        city: formValue.city,
        gender: formValue.gender,
      };

      if (formValue.changePassword && formValue.newPassword) {
        updatedClient.password = formValue.newPassword;
      }

      if (!updatedClient.name || !updatedClient.surname || !updatedClient.email || !updatedClient.address || !updatedClient.city) {
        this.toastr.error('Veuillez remplir tous les champs obligatoires', 'Erreur de validation',
          {
            timeOut: 3000,
            progressBar: true,
          }
          );
        return;
      }

      this.clientService.updateClient(this.clientJwt.id, updatedClient).subscribe(
        (client) => {
          console.log('Client updatedClient', updatedClient);
          console.log('Client updated:', client);
          if (this.$client) {
            this.$client = this.clientService.getClientById(this.clientJwt.id);
          }
          this.editProfileModal?.hide();
          this.toastr.success('Votre profil a été mis à jour avec succès', 'Mise à jour réussie',
            {
              timeOut: 3000,
              progressBar: true,
            }
            );
        },
        (error) => {
          console.error('Error updating client:', error);
          this.toastr.error('Une erreur s\'est produite lors de la mise à jour du profil', 'Erreur',
            {
              timeOut: 3000,
              progressBar: true,
            }
            );
        }
      );
    }
  }

  compareCity(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareGender(g1: any, g2: any): boolean {
    return g1 && g2 ? g1.id === g2.id : g1 === g2;
  }

  getFilteredOrders(): Observable<IOrder[]> {
    return this.$client ? this.$client.pipe(
      map(client => (client?.orders || []).filter(order => {
        const isCompleted = order.orderStatus.name === 'Livré';
        return this.showCompletedOrders ? isCompleted : !isCompleted;
      }))
    ) : of([]);
  }

}
