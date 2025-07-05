import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductListComponent } from '../../../products/product-list/product-list.component';

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
export class ProductsAdminComponent {
  productForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      image: ['', Validators.required]
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
}