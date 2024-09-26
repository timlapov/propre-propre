import {Component, inject, OnInit} from '@angular/core';
import {EmployeeService} from "../../services/employee.service";
import {AuthService} from "../../services/auth.service";
import {Observable, of} from "rxjs";
import {IEmployee, IOrder, IOrderStatus} from "../../services/entities";
import {AsyncPipe, CommonModule, CurrencyPipe, DatePipe, JsonPipe, NgForOf, NgIf} from "@angular/common";
import {OrderService} from "../../services/order.service";
import {SupportService} from "../../services/support.service";
import { FormsModule } from "@angular/forms";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    JsonPipe,
    DatePipe,
    CurrencyPipe,
    NgIf,
    NgForOf,
    FormsModule,
    CommonModule,
  ],
  templateUrl: './employee-dashboard.component.html',
  styleUrl: './employee-dashboard.component.css'
})
export class EmployeeDashboardComponent implements OnInit {

  employeeService = inject(EmployeeService);
  authService = inject(AuthService);
  employeeJwt = this.authService.getCurrentUser();
  orderService = inject(OrderService);
  supportService = inject(SupportService);
  toastr = inject(ToastrService);

  orderStatuses?: IOrderStatus[];

  employee$?: Observable<IEmployee>;
  activeOrders$?: Observable<IOrder[]>;

  ngOnInit(): void {
    if (this.employeeJwt && this.employeeJwt.id) {
      this.employee$ = this.employeeService.getEmployeeById(this.employeeJwt.id);
      this.activeOrders$ = this.orderService.getActiveOrdersForEmployee(this.employeeJwt.id);
    }
    this.supportService.getAllOrderStatuses().subscribe(
      (orderStatuses) => {
        this.orderStatuses = orderStatuses;
      },
      (error) => {
        this.toastr.error(error, 'Erreur lors du chargement des commandes. Notifier l\'administrateur',
          {
            closeButton: true,
            timeOut: 10000,
            progressBar: true,
          }
        );
      }
      );
  }

  onOrderStatusChange(orderId: number, newStatusId: number): void {
    const confirmMessage = `Êtes-vous sûr de vouloir modifier l'état de la commande ${orderId}?`;
    if (confirm(confirmMessage)) {
      this.orderService.updateOrderStatus(orderId, newStatusId).subscribe(
        (updatedOrder) => {
          this.toastr.success('Le statut de la commande a été mis à jour', 'Modification réussie', {
            timeOut: 3000,
            progressBar: true,
          });
          window.location.reload();
        },
        (error) => {
          this.toastr.error('Réessayez dans quelques minutes ou contactez l\'administrateur. ', 'Erreur de mise à jour du statut de la commande.',
            {
              closeButton: true,
              timeOut: 7000,
              progressBar: true,
            }
          );
        }
      );
    } else {
      this.toastr.info('La modification a été annulée', 'Attention',
        {
          timeOut: 3000,
          progressBar: true,
        }
      );
    }
  }

  protected readonly of = of;
}
