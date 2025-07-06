import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {OrderService, Order} from '../order.service';
import {Product} from '../../../products/product.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private orderService: OrderService,
              private router: Router) {
  }

  ngOnInit() {
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

  goToEditOrder(order: Order): void {
    this.router.navigate(['/edit-orders', order.order_id]);
  }
}
