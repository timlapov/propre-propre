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
    return this.http.post<IClient>(`${this.url}api/clients`, clientData, { headers: this.headers });
  }

  getClientById(id: number): Observable<IClient> {
    return this.http.get<IClient>(`${this.url}api/clients/${id}`);
  }

  updateClient(id: number, client: Partial<IClient>): Observable<IClient> {
    const clientData = {
      ...client,
      city: client.city ? `/api/cities/${client.city.id}` : undefined,
      gender: client.gender ? `/api/genders/${client.gender.id}` : undefined
    };

    const knownKeys: (keyof IClient)[] = ['id', 'email', 'name', 'surname', 'birthdate', 'address', 'city', 'gender', 'password'];
    knownKeys.forEach(key => {
      if (clientData[key] === undefined) {
        delete clientData[key];
      }
    });

    let headers = new HttpHeaders();
    this.headers.keys().forEach(key => {
      headers = headers.set(key, this.headers.get(key) || '');
    });
    headers = headers.set('Content-Type', 'application/merge-patch+json');
    headers = headers.set('Accept', 'application/ld+json');

    return this.http.patch<IClient>(`${this.url}api/clients/${id}`, clientData, { headers });
  }

}
