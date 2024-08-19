import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {HydraCollection} from "./auth";
import {ICity, IGender, IService} from "./entities";
import {map} from "rxjs";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SupportService {

  url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllCities() {
    return this.http.get<HydraCollection<ICity>>(`${this.url}/cities`).pipe(
      map(response => response['hydra:member'])
    );
  }

  getAllGenders() {
    return this.http.get<HydraCollection<IGender>>(`${this.url}/genders`).pipe(
      map(response => response['hydra:member'])
    );
  }


}
