import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  product_id: number;
  name: string;
  price: number;
  description?: string;
  stock_quantity: number;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private http: HttpClient) {}

  // Alle Produkte abrufen
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('/api/get-products');
  }

  // Einzelnes Produkt anhand der ID abrufen
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`/api/get-product/${id}`);
  }

  // Produkt aktualisieren
  updateProduct(product: Product): Observable<any> {
    return this.http.put('/api/edit-product', product);  
  
  }

    // Produkt löschen
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete(`/api/delete-product/${productId}`, { withCredentials: true });
  }
}