import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
}

@Injectable({
  providedIn: 'root'
})

export class ProductsService {
  private apiUrl = 'http://localhost:4000/api/get-products';

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}
