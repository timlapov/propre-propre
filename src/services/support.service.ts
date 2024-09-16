import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HydraCollection} from "./auth";
import {ICity, ICoefficients, IGender, IOrderStatus, IService} from "./entities";
import {map} from "rxjs";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllCities() {
    return this.http.get<HydraCollection<ICity>>(`${this.url}api/cities`).pipe(
      map(response => response['hydra:member'])
    );
  }

  getAllGenders() {
    return this.http.get<HydraCollection<IGender>>(`${this.url}api/genders`).pipe(
      map(response => response['hydra:member'])
    );
  }
  getAllOrderStatuses() {
    return this.http.get<HydraCollection<IOrderStatus>>(`${this.url}api/order_statuses`).pipe(
      map(response => response['hydra:member'])
    );
  }

  getServiceCoefficients() {
    return this.http.get<HydraCollection<ICoefficients>>(`${this.url}api/service_coefficients`).pipe(
      map(response => {
        const members = response['hydra:member'];
        if (members.length === 0) {
          throw new Error('No service coefficients found');
        }
        return members[members.length - 1];
      })
    );
  }

}
