import { Component, OnInit } from '@angular/core';
import {CommonModule } from '@angular/common';
import { ProductService, Product } from '../product.service';
import { CartService } from '../../user/customer-dashboard/cart-list/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {
  product: Product[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private productService: ProductService,
    private cart: CartService,
    private router : Router
  ) {}


  ngOnInit() {
    this.productService.getProducts().subscribe({
      next: data => {
        this.product = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Produkte';
        this.loading = false;
      }
    });
  }

  addToCart(product: Product): void {
    this.cart.add(product);
    this.router.navigate(['/product', product.product_id]);
  }

  goToDetails(product: Product): void {
  this.router.navigate(['/product', product.product_id]);
}
}
