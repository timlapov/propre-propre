import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {forkJoin, map, Observable, of} from "rxjs";
import {IOrder} from "./entities";
import {environment} from "../environments/environment";
import {HydraCollection} from "./auth";
import {AuthService} from "./auth.service";
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  getOrders(params: { [key: string]: string | number | boolean }): Observable<IOrder[]> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key].toString());
    });
    return this.http.get<HydraCollection<IOrder>>(`${this.apiUrl}api/orders`, { params: httpParams }).pipe(
      map(response => response['hydra:member'])
    );
  }

  getActiveOrders(): Observable<IOrder[]> {
    return this.getOrders({ 'exists[completed]': false });
  }

  getActiveOrdersForEmployee(employeeId: number): Observable<IOrder[]> {
    return this.getOrders({
      'exists[completed]': false,
      'employee.id': employeeId
    });
  }

  updateOrderStatus(orderId: number, statusId: number): Observable<IOrder> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/merge-patch+json',
      'Accept': 'application/ld+json'
    });

    const body = {
      orderStatus: `/api/order_statuses/${statusId}`
    };

    return this.http.patch<IOrder>(`${this.apiUrl}api/orders/${orderId}`, body, { headers });
  }

  createOrder(orderData: any): Observable<IOrder> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json',
    });
    return this.http.post<IOrder>(`${this.apiUrl}api/orders`, orderData, { headers });
  }

}
