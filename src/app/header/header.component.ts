import {Component, inject} from '@angular/core';
import {RouterLink} from "@angular/router";
import {AuthService} from "../../services/auth.service";
import {NgClass, NgIf} from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    NgIf,
    NgClass
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  authService = inject(AuthService);

  isNavbarCollapsed = false;

  logout(): void {
    this.authService.logout();
  }

  get hasCartItems(): boolean {
    const cart = localStorage.getItem('cart');
    if (!cart) {
      return false;
    }
    const cartItems = JSON.parse(cart);
    return Array.isArray(cartItems) && cartItems.length > 0;
  }
}
