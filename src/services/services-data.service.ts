import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {HydraCollection, IToken} from "./auth";
import {IService} from "./entities";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ServicesDataService {
  url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // getAllServices(): Observable<IService[]> {
  //   return this.http.get<IService[]>(`${this.url}/services`)
  // }
  getAllServices(): Observable<IService[]> {
    return this.http.get<HydraCollection<IService>>(`${this.url}api/services`).pipe(
      map(response => response['hydra:member'])
    );
  }
}
