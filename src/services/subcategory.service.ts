import { Injectable } from '@angular/core';
import {environment} from "../environments/environment";
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {ICategory, IService, ISubcategory} from "./entities";

interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
}

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {

  url = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllCategories(): Observable<ICategory[]> {
    return this.http.get<HydraCollection<ICategory>>(`${this.url}api/categories`).pipe(
      map(response => response['hydra:member'])
  );
  }

  getAllSubcategories(): Observable<ISubcategory[]> {
    return this.http.get<HydraCollection<ISubcategory>>(`${this.url}api/subcategories`).pipe(
      map(response => response['hydra:member'])
    );
  }

}
