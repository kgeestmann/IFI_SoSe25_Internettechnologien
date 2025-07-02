import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../product.service';
import { CartService } from '../../user/customer-dashboard/cart-list/cart.service';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isCustomer = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProducts().subscribe(products => {
        this.product = products.find(p => p.product_id === +id) || null;
      });
    }

    this.authService.isCustomer$.subscribe(status => {
      this.isCustomer = status;
    });
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.add(this.product);
      alert(`${this.product.name} wurde zum Warenkorb hinzugefügt.`);
    }
  }

  goBack(): void {
  this.location.back();
}

goToCart(): void {
  if (this.isCustomer) {
    this.router.navigate(['/cart']);
  } else {
    this.router.navigate(['/login']);
  }
}

}
