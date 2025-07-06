import { Component } from '@angular/core';
import { MyOrdersService, Order } from './my-orders.service';
import { AuthService } from '../../../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-orders',
  imports: [ CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent {
  orders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;

  currentUser: any;
  isEmployee = false;

  constructor(
    private orderService: MyOrdersService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.checkSession();
    this.loadOrders(); 
  }
  
  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Bestellungen';
        this.loading = false;
      }
    });
  }
}
