import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ICity, IClient, IGender} from "./entities";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  url = environment.apiUrl;
  private headers = new HttpHeaders({
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json'
  });

  constructor(private http: HttpClient) { }

  addClient(
    email: string,
    name: string,
    surname: string,
    birthdate: Date | null,
    address: string,
    city: ICity | null,
    gender: IGender | null,
    password: string
  ): Observable<IClient> {
    const clientData = {
      email,
      name,
      surname,
      birthdate: birthdate instanceof Date
        ? birthdate.toISOString().split('T')[0]
        : birthdate,
      address,
      city: city ? `/api/cities/${city.id}` : null,
      gender: gender ? `/api/genders/${gender.id}` : null,
      password
    };
    return this.http.post<IClient>(`${this.url}/clients`, clientData, { headers: this.headers });
  }

}
