import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments/environment";
import {HydraCollection, ITokenResponse} from "./auth";
import {IService} from "./entities";
import {map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ServicesDataService {
  private url = environment.apiUrl;
  http = inject(HttpClient);

  getAllServices(): Observable<IService[]> {
    return this.http.get<HydraCollection<IService>>(`${this.url}api/services`).pipe(
      map(response => response['hydra:member'])
    );
  }
}
