import { ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { combineLatest, map, Observable, of, Subscription, tap } from "rxjs";
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
import {ClientService} from "../../services/client.service";
import {PaymentMethodModalComponent} from "../payment-method-modal/payment-method-modal.component";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgClass,
    FormsModule,
    CommonModule,
    PaymentMethodModalComponent,
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  // Injecting services using Angular's inject function
  private servicesDataService = inject(ServicesDataService);
  private subcategoryService = inject(SubcategoryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private supportService = inject(SupportService);
  private toastr = inject(ToastrService);

  @ViewChild('paymentMethodModal') paymentMethodModal!: PaymentMethodModalComponent;

  cart: CartItem[] = [];
  cartItemOptions: { [subcategoryId: number]: { ironing: boolean, perfuming: boolean } } = {};
  servicesMap: { [id: number]: IService } = {};
  orderStatuses: IOrderStatus[] = [];
  initialOrderStatus: IOrderStatus | null = null;
  coefficients: ICoefficients | null = null;
  activeServiceId: number | null = null;
  isExpress: boolean = false;
  isPlacingOrder: boolean = false;
  selectedPaymentMethod: 'cash' | 'card' = 'cash';

  services$: Observable<IService[]> = this.servicesDataService.getAllServices().pipe(
    tap(services => {
      if (services.length > 0) {
        this.activeServiceId = services[0].id;
      }
      services.forEach(service => {
        this.servicesMap[service.id] = service;
      });
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
    })
  );

  ngOnInit() {
    this.loadCartFromLocalStorage();
    this.supportService.getAllOrderStatuses().subscribe(statuses => {
      this.orderStatuses = statuses;
      this.initialOrderStatus = statuses[0];
    });
    this.supportService.getServiceCoefficients().subscribe(coefficients => {
      this.coefficients = coefficients;
    });
  }

  setActiveService(serviceId: number) {
    this.activeServiceId = serviceId;
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
    this.saveCartToLocalStorage();
  }

  removeFromCart(item: CartItem) {
    const index = this.cart.indexOf(item);
    if (index > -1) {
      this.cart.splice(index, 1);
      this.saveCartToLocalStorage();
    }
  }

  removeItemFromCart(item: CartItem): void {
    const cartItem = this.cart.find(cartItem => cartItem === item);
    if (cartItem) {
      cartItem.quantity -= 1;
      if (cartItem.quantity <= 0) {
        this.removeFromCart(cartItem);
      } else {
        this.saveCartToLocalStorage();
      }
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
      this.openPaymentMethodModal();
    } else {
      this.router.navigate(['/login']);
    }
  }

  openPaymentMethodModal() {
    if (this.paymentMethodModal) {
      this.paymentMethodModal.open();
    }
  }

  onPaymentMethodSelected(paymentMethod: 'cash' | 'card') {
    this.selectedPaymentMethod = paymentMethod;
    this.initiateOrderPlacement();
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
        'perfuming': item.perfuming,
        'quantity': item.quantity,
      })),
      express: this.isExpress,
      paymentMethod: this.selectedPaymentMethod
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
          this.toastr.success('Commande passée avec succès. Notre employé vous contactera pour discuter de la livraison.', 'Succès',
            { timeOut: 10000, progressBar: true });
          this.cart = [];
          this.saveCartToLocalStorage();
          this.router.navigate(['/client/profile']);
        }
      }
    );
  }

  getSubcategoryPrice(subcategory: ISubcategory): number {
    if (!this.coefficients || !this.activeServiceId) return 0;

    const options = this.getCartItemOptions(subcategory.id);
    return this.calculatePrice(
      subcategory.price_coefficient,
      this.activeServiceId,
      options.ironing,
      options.perfuming
    );
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
    return this.calculatePrice(
      item.subcategory.price_coefficient,
      item.serviceId,
      item.ironing,
      item.perfuming,
      item.quantity
    );
  }

  private calculatePrice(
    basePriceCoefficient: number,
    serviceId: number,
    ironing: boolean,
    perfuming: boolean,
    quantity: number = 1
  ): number {
    let price = basePriceCoefficient;
    const service = this.servicesMap[serviceId];

    if (service) {
      price *= service.price;
    }

    if (ironing) {
      price *= this.coefficients!.ironingCoefficient;
    }

    if (perfuming) {
      price *= this.coefficients!.perfumingCoefficient;
    }

    price *= quantity;
    return price;
  }

  // This makes environment configuration accessible in the component and prevents modification.
  protected readonly environment = environment;
}
