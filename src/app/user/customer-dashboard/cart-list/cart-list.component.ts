import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // NgFor ist im CommonModule enthalten
import { CartItem, CartService } from './cart.service';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-list.component.html',
  styleUrls: ['./cart-list.component.css']
})
export class CartListComponent implements OnInit {
  cartItems: CartItem[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit(): void {
  this.cartService.getCart().subscribe({
    next: cart => {
      this.cartItems = cart.items;  // <-- Hier
    },
    error: () => {
      console.error('Warenkorb konnte nicht geladen werden');
    }
  });
}

  // 💡 Neue Getter-Methode für die Gesamtsumme
  get totalPrice(): number {
    return this.cartItems
      .map(item => item.price * item.quantity)
      .reduce((sum, current) => sum + current, 0);
  }
}
