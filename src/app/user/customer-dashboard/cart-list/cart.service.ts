import { Injectable, signal, computed } from '@angular/core';
//import { LoginServiceService } from '../../login/login-service.service';
import { Product } from '../../../products/product.service';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartSig = signal<CartItem[]>([]);

  readonly items     = computed(() => this.cartSig());
  readonly itemCount = computed(() =>
    this.cartSig().reduce((sum, ci) => sum + ci.quantity, 0)
  );

  //constructor(private auth: LoginServiceService) {}

  add(p: Product, qty = 1): void {
    if (!this.auth.isLoggedIn()) {
      alert('Bitte zuerst einloggen');
      return;
    }
    this.cartSig.update(arr => {
      const idx = arr.findIndex(ci => ci.product.product_id === p.product_id);
      if (idx > -1) {
        // Menge erhöhen
        const updated = [...arr];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + qty,
        };
        return updated;
      }
      // neues Item
      return [...arr, { product: p, quantity: qty }];
    });
  }

  remove(target: number | Product, qty = 1): void {
    this.cartSig.update(arr => {
      const idx =
        typeof target === 'number'
          ? target
          : arr.findIndex(ci => ci.product.product_id === target.product_id);
      if (idx < 0) return arr;

      const item = arr[idx];
      if (item.quantity > qty) {
        const updated = [...arr];
        updated[idx] = { ...item, quantity: item.quantity - qty };
        return updated;
      }
      return arr.filter((_, i) => i !== idx); // komplett entfernen
    });
  }

  clear(): void {
    this.cartSig.set([]);
  }

  totalPrice() {
    return this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }
  
}
