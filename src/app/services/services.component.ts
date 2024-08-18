import {Component, inject, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {IService, ISubcategory} from "../../services/entities";
import {ServicesDataService} from "../../services/services-data.service";
import {AsyncPipe} from "@angular/common";
import {SubcategoryService} from "../../services/subcategory.service";

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    AsyncPipe
  ],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent implements OnInit {
  services$: Observable<IService[]> = inject(ServicesDataService).getAllServices();

  subcategories$: Observable<ISubcategory[]> = inject(SubcategoryService).getAllSubcategories();

  ngOnInit() {
    this.services$.subscribe(
      services => console.log('Received services:', services),
      error => console.error('Error:', error)
    );
  }
}
