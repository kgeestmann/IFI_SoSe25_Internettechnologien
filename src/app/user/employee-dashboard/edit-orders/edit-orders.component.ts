import {Component, OnInit} from '@angular/core';
import {Order, OrderService} from '../order.service';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-orders.component.html',
  styleUrl: './edit-orders.component.css',
  standalone: true,
})
export class EditOrdersComponent implements OnInit {
  order: Order | null = null;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error = 'Ungültige Bestellung-ID.';
      return;
    }
    this.loadOrder(id);
  }

  loadOrder(id: number): void {
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        if (order) {
          this.order = order;
          this.error = '';
        } else {
          this.error = 'Bestellung nicht gefunden.';
        }
      },
      error: () => {
        this.error = 'Fehler beim Laden des Bestellung.';
      },
    });
  }

  editOrder(): void {
    this.orderService.editOrder(this.order);
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/orders-admin']);
  }
}
