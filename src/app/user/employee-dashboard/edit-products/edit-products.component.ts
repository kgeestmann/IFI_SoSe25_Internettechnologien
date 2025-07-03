import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../../products/product.service';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-edit-products',
  templateUrl: './edit-products.component.html',
  styleUrls: ['./edit-products.component.css'],
  standalone: true,          
  imports: [CommonModule],  
})
export class EditProductsComponent implements OnInit {
  product: Product | null = null;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.error = 'Ungültige Produkt-ID.';
      return;
    }

    this.loadProduct(id);
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
    this.router.navigate(['/products']);
  }
}