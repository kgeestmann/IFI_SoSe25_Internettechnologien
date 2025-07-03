import { Injectable } from '@angular/core';
import { Product } from '../../../products/product.service';
import { AuthService } from '../../../auth.service';
import { HttpClient } from '@angular/common/http';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private userId: number | null = null;

  constructor(private auth: AuthService, private http: HttpClient) {
    this.auth.currentUser$.subscribe(user => {
      this.userId = user?.user_id ?? null;
    });
  }

  add(p: Product, qty = 1): void {
    if (!this.userId) {
      alert('Bitte zuerst einloggen');
      return;
    }

    this.http.post('/api/cart/add', {
      customer_id: this.userId,
      product_id: p.product_id,
      quantity: qty,
      price: p.price * qty,
    }).subscribe({
      next: () => {
        // Hier kannst du den lokalen Signal-Status aktualisieren,
        // z.B. per erneuten Laden des Warenkorbs vom Backend.
        console.log('Artikel erfolgreich hinzugefügt');
      },
      error: () => {
        alert('Fehler beim Hinzufügen zum Warenkorb');
      }
    });
  }
}
