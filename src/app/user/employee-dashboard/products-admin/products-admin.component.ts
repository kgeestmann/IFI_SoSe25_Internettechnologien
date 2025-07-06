import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductListComponent } from '../../../products/product-list/product-list.component';
import { AuthService } from '../../../auth.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  templateUrl: './products-admin.component.html',
  styleUrls: ['./products-admin.component.css'],
  imports: [
    ReactiveFormsModule,
    ProductListComponent
  ]
})
export class ProductsAdminComponent implements OnInit {
  productForm: FormGroup;
  currentUser: any;
  isEmployee = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      image: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.checkSession();

    combineLatest([
      this.authService.isLoggedIn$,
      this.authService.isEmployee$
    ]).subscribe(([loggedIn, isEmployee]) => {
      this.isEmployee = isEmployee;

      if (loggedIn && isEmployee && !this.currentUser) {
        this.loadUserDetails();
      }
    });
  }

  onSubmit() {
    if (!this.productForm.valid) {
      return;
    }

    const productData = this.productForm.value;

    this.http.post('/api/products', productData).subscribe({
      next: () => {
        alert('Produkt erfolgreich erstellt!');
        this.productForm.reset();
      },
      error: (err) => {
        alert('Fehler beim Erstellen des Produkts');
        console.error(err);
      }
    });
  }

  loadUserDetails() {
    this.authService.fetchUserDetails().subscribe({
      next: (details) => {
        this.currentUser = details;
        this.authService.setLogin(details);
      },
      error: (err) => {
        console.error('Fehler beim Laden der User-Details', err);
      }
    });
  }
}