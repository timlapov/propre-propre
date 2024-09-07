import {ChangeDetectorRef, Component, computed, inject, OnInit, signal} from '@angular/core';
import {combineLatest, map, Observable, tap} from "rxjs";
import {CartItem, ICategory, ICoefficients, IOrderStatus, IService, ISubcategory} from "../../services/entities";
import { ServicesDataService } from "../../services/services-data.service";
import {AsyncPipe, CommonModule, NgClass, NgFor} from "@angular/common";
import { SubcategoryService } from "../../services/subcategory.service";
import {FormsModule} from "@angular/forms";
import {AuthService} from "../../services/auth.service";
import {Router} from "@angular/router";
import {OrderService} from "../../services/order.service";
import {SupportService} from "../../services/support.service";


@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgClass,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  private servicesDataService = inject(ServicesDataService);
  private subcategoryService = inject(SubcategoryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private supportService = inject(SupportService);
  private cdr = inject(ChangeDetectorRef);

  cart: CartItem[] = [];
  cartItemOptions: { [subcategoryId: number]: { ironing: boolean, perfuming: boolean } } = {};
  servicesMap: { [id: number]: IService } = {};

  orderStatuses: IOrderStatus[] = [];
  initialOrderStatus: IOrderStatus | null = null;
  coefficients: ICoefficients | null = null;

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

  activeServiceId: number | null = null;
  isExpress: boolean = false;

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
    console.log(this.coefficients);
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
      this.createOrder();
    } else {
      this.router.navigate(['/login']);
    }
  }

  createOrder() {
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

    this.orderService.createOrder(orderData).subscribe(
      response => {
        // Order created successfully
        this.cart = [];
        this.saveCartToLocalStorage();
        this.router.navigate(['/client/profile']);
      },
      error => {
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

}
