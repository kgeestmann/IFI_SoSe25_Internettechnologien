import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../../../products/product.service';
import { AuthService } from '../../../auth.service';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';

export interface CartItem {
  product_id: number;
  name: string;
  description: string;
  image_url: string;
  quantity: number;
  price: number;
}

export interface Cart {
  cart_id: number;
  items: CartItem[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private userId: number | null = null;

  // Optionale Signals für reactive Nutzung im UI
  private cart = signal<Cart | null>(null);
  readonly cart$ = computed(() => this.cart());

  constructor(private auth: AuthService, private http: HttpClient) {
    this.auth.currentUser$.subscribe(user => {
      this.userId = user?.user_id ?? null;
      if (this.userId) {
        this.getCart(); // Lade Cart beim Login
      }
    });
  }

  /**
   * Artikel zum Warenkorb hinzufügen
   */
  add(p: Product, qty = 1): void {
    if (!this.userId) {
      alert('Bitte zuerst einloggen');
      return;
    }

    this.http.post('/api/cart/add', {
      customer_id: this.userId, 
      product_id: p.product_id,
      quantity: qty,
      price: p.price * qty
    }).subscribe({
      next: () => {
        console.log('Artikel erfolgreich hinzugefügt');
        this.getCart(); // optional: Warenkorb nach dem Hinzufügen aktualisieren
      },
      error: () => {
        alert('Fehler beim Hinzufügen zum Warenkorb');
      }
    });
  }

  getCart() {
  return this.http.get<Cart>('/api/get-cart');
}

}
