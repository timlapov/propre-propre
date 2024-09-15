// services.component.ts
import { ChangeDetectorRef, Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import {combineLatest, map, Observable, of, Subscription, tap, throwError} from "rxjs";
import {
  CartItem,
  ICategory,
  IClient,
  ICoefficients,
  IOrderStatus,
  IService,
  ISubcategory
} from "../../services/entities";
import { ServicesDataService } from "../../services/services-data.service";
import { AsyncPipe, CommonModule, NgClass, NgFor } from "@angular/common";
import { SubcategoryService } from "../../services/subcategory.service";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { OrderService } from "../../services/order.service";
import { SupportService } from "../../services/support.service";
import { finalize, timeout, catchError } from 'rxjs/operators';
import { ToastrService } from "ngx-toastr";
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import {ClientService} from "../../services/client.service"; // Adjust the path accordingly

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgClass,
    FormsModule,
    CommonModule,
    ConfirmationModalComponent // Import the modal component
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  private servicesDataService = inject(ServicesDataService);
  private subcategoryService = inject(SubcategoryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private supportService = inject(SupportService);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);
  private clientService = inject(ClientService);

  @ViewChild('confirmationModal') confirmationModal!: ConfirmationModalComponent;

  cart: CartItem[] = [];
  cartItemOptions: { [subcategoryId: number]: { ironing: boolean, perfuming: boolean } } = {};
  servicesMap: { [id: number]: IService } = {};
  orderStatuses: IOrderStatus[] = [];
  initialOrderStatus: IOrderStatus | null = null;
  coefficients: ICoefficients | null = null;
  customerAddress: string = '';
  activeServiceId: number | null = null;
  isExpress: boolean = false;
  isPlacingOrder: boolean = false;
  orderTimeoutSubscription!: Subscription;

  services$: Observable<IService[]> = this.servicesDataService.getAllServices().pipe(
    tap(services => {
      if (services.length > 0) {
        this.activeServiceId = services[0].id;
      }
    })
  );
  categories$: Observable<ICategory[]> = this.subcategoryService.getAllCategories();
  subcategories$: Observable<ISubcategory[]> = this.subcategoryService.getAllSubcategories();
  categoriesWithSubcategories$: Observable<(ICategory & { subcategories: ISubcategory[] })[]> = combineLatest([
    this.categories$,
    this.subcategories$
  ]).pipe(
    map(([categories, subcategories]) => {
      return categories.map(category => ({
        ...category,
        subcategories: subcategories.filter(sub => sub.category === `/api/categories/${category.id}`)
      }));
    }),
    tap(result => console.log('Categories with subcategories:', result))
  );

  ngOnInit() {
    this.services$.subscribe(
      services => console.log('Received services:', services),
      error => console.error('Error:', error)
    );
    this.categoriesWithSubcategories$.subscribe(
      categories => console.log('Received categories:', categories),
    );
    this.subcategories$.subscribe(
      subcategories => console.log('Received subcategories:', subcategories),
      error => console.error('Error loading subcategories:', error)
    );
    this.loadCartFromLocalStorage();
    this.services$.subscribe(services => {
      services.forEach(service => {
        this.servicesMap[service.id] = service;
      });
    });
    this.supportService.getAllOrderStatuses().subscribe(statuses => {
      this.orderStatuses = statuses;
      this.initialOrderStatus = statuses[0];
    });
    this.supportService.getServiceCoefficients().subscribe(coefficients => {
      this.coefficients = coefficients;
      console.log('Coefficients:', this.coefficients);
    });
    if (this.authService.isLogged()) {
      this.fetchCustomerAddress();
    }
  }

  setActiveService(serviceId: number) {
    this.activeServiceId = serviceId;
    console.log('Active service:', this.activeServiceId);
    this.cdr.detectChanges(); // Use detectChanges to update the view immediately
  }

  addToCart(subcategory: ISubcategory) {
    const options = this.getCartItemOptions(subcategory.id);
    const ironing = options.ironing;
    const perfuming = options.perfuming;

    const existingCartItem = this.cart.find(item =>
      item.subcategory.id === subcategory.id &&
      item.ironing === ironing &&
      item.perfuming === perfuming &&
      item.serviceId === this.activeServiceId
    );

    if (existingCartItem) {
      existingCartItem.quantity += 1;
    } else {
      this.cart.push(<CartItem>{
        subcategory: subcategory,
        ironing: ironing,
        perfuming: perfuming,
        quantity: 1,
        serviceId: this.activeServiceId
      });
    }

    // Reset options after adding to cart
    this.cartItemOptions[subcategory.id] = {
      ironing: false,
      perfuming: false
    };

    this.saveCartToLocalStorage();
  }

  removeFromCart(item: CartItem) {
    const index = this.cart.indexOf(item);
    if (index > -1) {
      this.cart.splice(index, 1);
      this.saveCartToLocalStorage();
    }
  }

  getCartItemOptions(subcategoryId: number) {
    if (!this.cartItemOptions[subcategoryId]) {
      this.cartItemOptions[subcategoryId] = {
        ironing: false,
        perfuming: false
      };
    }
    return this.cartItemOptions[subcategoryId];
  }

  saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  loadCartFromLocalStorage() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      this.cart = JSON.parse(cartData);
    }
  }

  placeOrder() {
    if (this.authService.isLogged()) {
      this.openConfirmationModal();
    } else {
      this.router.navigate(['/login']);
    }
  }

  openConfirmationModal() {
    if (this.confirmationModal) {
      this.confirmationModal.open();
    }
  }

  onAddressConfirmed() {
    // User confirmed the address, proceed with placing the order
    this.initiateOrderPlacement();
  }

  onAddressModify() {
    // User chose to modify the address, redirect to profile
    this.router.navigate(['/client/profile']);
  }

  initiateOrderPlacement() {
    this.isPlacingOrder = true; // Disable button and show spinner

    const orderData = {
      orderStatus: `/api/order_statuses/${this.initialOrderStatus?.id}`,
      client: `/api/clients/${this.authService.getClientId()}`,
      items: this.cart.map(item => ({
        '@type': 'Item',
        'subcategory': `/api/subcategories/${item.subcategory.id}`,
        'service': `/api/services/${item.serviceId}`,
        'ironing': item.ironing,
        'perfuming': item.perfuming
      })),
      express: this.isExpress
    };

    // Start the order creation process with a 10-second timeout
    this.orderService.createOrder(orderData).pipe(
      timeout(10000), // 10 seconds timeout
      catchError(err => {
        if (err.name === 'TimeoutError') {
          this.toastr.error('La commande ne peut pas être traitée actuellement. Veuillez réessayer plus tard.', 'Erreur de traitement',
            { timeOut: 5000, progressBar: true });
        } else {
          this.toastr.error('Une erreur est survenue lors de la création de la commande.', 'Erreur',
            { timeOut: 5000, progressBar: true });
        }
        this.isPlacingOrder = false; // Re-enable button
        return of(null); // Return observable to complete the stream
      }),
      finalize(() => {
        this.isPlacingOrder = false; // Re-enable button in all cases
      })
    ).subscribe(
      response => {
        if (response) {
          // Order created successfully
          this.toastr.success('Commande passée avec succès. Vous pouvez payer sur votre page de profil ou en espèces lors de la livraison.', 'Succès',
            { timeOut: 10000, progressBar: true });
          this.cart = [];
          this.saveCartToLocalStorage();
          this.router.navigate(['/client/profile']);
        }
      },
      error => {
        // This block might not be necessary due to catchError, but kept for completeness
        console.error('Error creating order:', error);
      }
    );
  }

  getSubcategoryPrice(subcategory: ISubcategory): number {
    if (!this.coefficients || !this.activeServiceId) return 0;

    const options = this.getCartItemOptions(subcategory.id);
    let price = subcategory.price_coefficient;

    const service = this.servicesMap[this.activeServiceId];
    if (service) {
      price *= service.price;
    }

    if (options.ironing) {
      price *= this.coefficients.ironingCoefficient;
    }

    if (options.perfuming) {
      price *= this.coefficients.perfumingCoefficient;
    }

    return price;
  }

  getTotalPrice(): number {
    if (!this.coefficients) return 0;
    let total = this.cart.reduce((sum, item) => sum + this.calculateItemPrice(item), 0);

    if (this.isExpress) {
      total *= this.coefficients.expressCoefficient;
    }
    return total;
  }

  calculateItemPrice(item: CartItem): number {
    if (!this.coefficients) return 0;
    let price = item.subcategory.price_coefficient;
    const service = this.servicesMap[item.serviceId];

    if (service) {
      price *= service.price;
    }
    if (item.ironing) {
      price *= this.coefficients.ironingCoefficient;
    }
    if (item.perfuming) {
      price *= this.coefficients.perfumingCoefficient;
    }
    price *= item.quantity;
    return price;
  }

  fetchCustomerAddress() {
    const clientId = this.authService.getClientId();
    if (clientId === null) {
      console.error('Client ID is null. User might not be properly authenticated.');
      return;
    }

    this.clientService.getClientById(clientId).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération des informations du client:', error);
        return of(null); // Continue without the address
      })
    ).subscribe((client: IClient | null) => {
      if (client) {
        this.customerAddress = `${client.address}, ${client.city?.name}`;
        console.log('Adresse du client récupérée:', this.customerAddress);
      } else {
        this.customerAddress = 'Adresse non disponible';
      }
    });
  }

}
