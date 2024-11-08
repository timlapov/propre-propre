import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ICity, IClient, IGender} from "./entities";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private url = environment.apiUrl;
  private headers = new HttpHeaders({
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json'
  });

  constructor(private http: HttpClient) { }

  addClient(
    email: string,
    name: string,
    surname: string,
    birthdate: string | null,
    address: string,
    city: ICity | null,
    gender: IGender | null,
    password: string
  ): Observable<IClient> {
    const clientData = {
      email,
      name,
      surname,
      birthdate: birthdate ? new Date(birthdate).toISOString().split('T')[0] : null,
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

    // Remove undefined properties from clientData
    Object.keys(clientData).forEach(key => {
      if (clientData[key as keyof IClient] === undefined) {
        delete clientData[key as keyof IClient];
      }
    });

    // Set headers for PATCH request
    const headers = this.headers.set('Content-Type', 'application/merge-patch+json');
    return this.http.patch<IClient>(`${this.url}api/clients/${id}`, clientData, { headers });
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.url}api/reset-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.url}api/reset-password/reset`, { token, password });
  }

}
