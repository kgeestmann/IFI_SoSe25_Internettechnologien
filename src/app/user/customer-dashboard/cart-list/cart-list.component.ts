import { Component } from '@angular/core';
import {CommonModule } from '@angular/common'; // NgFor ist im CommonModule enthalten
import { RouterLink } from '@angular/router';
import { CartService } from './cart.service';

@Component({
  selector: 'app-cart-list',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './cart-list.component.html',
  styleUrl: './cart-list.component.css'
})
export class CartListComponent {
  constructor(public cart: CartService) {
  
  }
}
