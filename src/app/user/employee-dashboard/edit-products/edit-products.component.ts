import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../../products/product.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-products',
  templateUrl: './edit-products.component.html',
  styleUrls: ['./edit-products.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class EditProductsComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  error = '';

  currentUser: any = null;
  isEmployee = false;

  private authSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.checkSession();

    this.authSub = combineLatest([
      this.authService.isLoggedIn$,
      this.authService.isEmployee$,
    ]).subscribe(([loggedIn, isEmployee]) => {
      this.isEmployee = isEmployee;

      if (loggedIn && isEmployee && !this.currentUser) {
        this.loadUserDetails();
      }
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error = 'Ungültige Produkt-ID.';
      return;
    }
    this.loadProduct(id);
  }

  loadUserDetails() {
    this.authService.fetchUserDetails().subscribe({
      next: (details) => {
        this.currentUser = details;
        this.authService.setLogin(details);
      },
      error: (err) => {
        console.error('Fehler beim Laden der User-Details', err);
      },
    });
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        if (product) {
          this.product = product;
          this.error = '';
        } else {
          this.error = 'Produkt nicht gefunden.';
        }
      },
      error: () => {
        this.error = 'Fehler beim Laden des Produkts.';
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/products-admin']);
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}