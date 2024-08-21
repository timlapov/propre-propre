import { Component, inject, OnInit, signal } from '@angular/core';
import {combineLatest, map, Observable, tap} from "rxjs";
import {ICategory, IService, ISubcategory} from "../../services/entities";
import { ServicesDataService } from "../../services/services-data.service";
import { AsyncPipe, NgClass, NgFor } from "@angular/common";
import { SubcategoryService } from "../../services/subcategory.service";

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    AsyncPipe,
    NgFor,
    NgClass
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  private servicesDataService = inject(ServicesDataService);
  private subcategoryService = inject(SubcategoryService);

  services$: Observable<IService[]> = this.servicesDataService.getAllServices().pipe(
    tap(services => {
      if (services.length > 0) {
        this.activeServiceId.set(services[0].id);
      }
    })
  );

  categories$: Observable<ICategory[]> = this.subcategoryService.getAllCategories();
  subcategories$: Observable<ISubcategory[]> = this.subcategoryService.getAllSubcategories();

  categoriesWithSubcategories$: Observable<(ICategory & { subcategories: ISubcategory[] })[]> = combineLatest([
    this.categories$,
    this.subcategories$
  ]).pipe(
    map(([categories, subcategories]) => {
      return categories.map(category => ({
        ...category,
        subcategories: subcategories.filter(sub => sub.category === `/api/categories/${category.id}`)
      }));
    }),
    tap(result => console.log('Categories with subcategories:', result))
  );

  activeServiceId = signal<number | null>(null);

  ngOnInit() {
    this.services$.subscribe(
      services => console.log('Received services:', services),
      error => console.error('Error:', error)
    );
    this.categoriesWithSubcategories$.subscribe(
      categories => console.log('Received categories:', categories),
    );
    this.subcategories$.subscribe(
      subcategories => console.log('Received subcategories:', subcategories),
      error => console.error('Error loading subcategories:', error)
    );
  }

  setActiveService(serviceId: number) {
    this.activeServiceId.set(serviceId);
    console.log('Активный сервис:', this.activeServiceId());
    // Здесь вы можете выполнить дополнительные действия при смене сервиса
  }
}
