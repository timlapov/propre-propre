import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {NgIf} from "@angular/common";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.css'
})

export class ClientProfileComponent implements OnInit {
  authService = inject(AuthService);
  client: any; // Замените 'any' на конкретный тип клиента, если он у вас определен

  ngOnInit() {
    this.client = this.authService.getCurrentUser();
    console.log(this.client);
  }
}
