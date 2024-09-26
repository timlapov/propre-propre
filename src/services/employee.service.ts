import {inject, Injectable} from '@angular/core';
import {Observable} from "rxjs";
import { IEmployee} from "./entities";
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private url = environment.apiUrl;

  http = inject(HttpClient);

  getEmployeeById(id: number): Observable<IEmployee> {
    return this.http.get<IEmployee>(`${this.url}api/employees/${id}`);
  }

}
