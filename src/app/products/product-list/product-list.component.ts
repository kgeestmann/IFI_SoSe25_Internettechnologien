import { Component, OnInit } from '@angular/core';
import { ProductsService, Product } from '../products.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-product-list',
  standalone: true,  
  imports: [CommonModule, HttpClientModule],
  providers: [ProductsService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})

export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data) => {
      this.products = data;
    });
  }
}
