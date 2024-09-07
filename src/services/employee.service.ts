import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {IClient, IEmployee} from "./entities";
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getEmployeeById(id: number): Observable<IEmployee> {
    return this.http.get<IEmployee>(`${this.url}api/employees/${id}`);
  }

}
