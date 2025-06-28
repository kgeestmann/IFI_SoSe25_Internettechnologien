import { Component, OnInit } from '@angular/core';
import {CommonModule } from '@angular/common'; // NgFor ist im CommonModule enthalten
import { ProductService, Product } from '../product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule], // Wichtig für *ngFor und *ngIf!
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  product: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(private productService: ProductService) {}

  ngOnInit() { //ändern druck in console produkte aus 
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Daten im Frontend:', data);
        this.product = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Fehler beim Laden der Produkte';
        this.loading = false;
      }
    });
  }
}
