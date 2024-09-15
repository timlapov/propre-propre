import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from "../../services/auth.service";
import { CommonModule, DatePipe } from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import { ICity, IClient, IGender, IOrder } from "../../services/entities";
import { ClientService } from "../../services/client.service";
import { Observable } from "rxjs";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SupportService } from "../../services/support.service";
import { Modal } from 'bootstrap';
import { ToastrService } from "ngx-toastr";
import {LeadingZerosPipe} from "../../pipes/leading-zeros.pipe";

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LeadingZerosPipe,
    RouterLink,
  ],
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit {
  // Services Injection
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private supportService = inject(SupportService);
  private datePipe = inject(DatePipe);
  private toastr = inject(ToastrService);

  // Component Properties
  clientJwt: any;
  $client: Observable<IClient> | undefined;
  client: IClient | undefined;
  showCompletedOrders: boolean = false;
  editProfileForm: FormGroup | undefined;
  cities: ICity[] = [];
  genders: IGender[] = [];
  changePassword: boolean = false;

  private editProfileModal: Modal | null = null;
  protected filteredOrders: IOrder[] = [];

  ngOnInit() {
    // Fetch Cities and Genders
    this.supportService.getAllCities().subscribe(cities => this.cities = cities);
    this.supportService.getAllGenders().subscribe(genders => this.genders = genders);

    // Fetch Client Data
    this.clientJwt = this.authService.getCurrentUser();
    if (this.clientJwt && this.clientJwt.id) {
      this.$client = this.clientService.getClientById(this.clientJwt.id);
      this.$client.subscribe(client => {
        this.client = client;
        this.initForm(client);
        this.filterOrders(); // Initialize filteredOrders
      });
    } else {
      console.error('No valid client JWT found');
      this.router.navigate(['/login']);
    }

    // Initialize Modal
    const modalElement = document.getElementById('editProfileModal');
    if (modalElement) {
      this.editProfileModal = new Modal(modalElement);
    }
  }

  // Initialize Edit Profile Form
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

    // Toggle Password Fields Based on Change Password Switch
    this.editProfileForm.get('changePassword')?.valueChanges.subscribe(value => {
      this.changePassword = value;
      const newPasswordControl = this.editProfileForm?.get('newPassword');
      if (value) {
        newPasswordControl?.setValidators([Validators.required, Validators.minLength(8)]);
      } else {
        newPasswordControl?.clearValidators();
        newPasswordControl?.setValue('');
      }
      newPasswordControl?.updateValueAndValidity();
    });
  }

  // Open Edit Profile Modal
  openEditModal() {
    this.editProfileModal?.show();
  }

  // Submit Edit Profile Form
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

      this.clientService.updateClient(this.clientJwt.id, updatedClient).subscribe(
        (client) => {
          console.log('Client updated:', client);
          // Refresh Client Data
          this.$client = this.clientService.getClientById(this.clientJwt.id);
          this.$client.subscribe(updatedClient => {
            this.client = updatedClient;
            this.filterOrders();
          });
          // Close Modal and Show Success Message
          this.editProfileModal?.hide();
          this.toastr.success('Votre profil a été mis à jour avec succès', 'Mise à jour réussie', {
            timeOut: 3000,
            progressBar: true,
          });
        },
        (error) => {
          console.error('Error updating client:', error);
          this.toastr.error('Une erreur s\'est produite lors de la mise à jour du profil', 'Erreur', {
            timeOut: 3000,
            progressBar: true,
          });
        }
      );
    }
  }

  // Compare Functions for Select Inputs
  compareCity(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

  compareGender(g1: any, g2: any): boolean {
    return g1 && g2 ? g1.id === g2.id : g1 === g2;
  }

  // Filter and Sort Orders
  filterOrders() {
    if (this.client && this.client.orders) {
      this.filteredOrders = this.client.orders
        .filter(order => {
          const isCompleted: boolean = order.orderStatus.name === 'Livré';
          return this.showCompletedOrders === isCompleted;
        })
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    } else {
      this.filteredOrders = [];
    }
  }

  // Toggle Between Ongoing and Completed Orders
  toggleOrdersView() {
    this.showCompletedOrders = !this.showCompletedOrders;
    this.filterOrders();
  }

  // TrackBy Function for Orders
  trackOrderId(index: number, order: IOrder): number {
    return order.id;
  }

  // TrackBy Function for Items
  trackItemId(index: number, item: any): number {
    return item.id;
  }

  protected readonly localStorage = localStorage;
  protected readonly JSON = JSON;
}
