import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // für *ngFor und *ngIf
import { CustomerService, Customer } from '../customer.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  loading = true;
  error: string | null = null;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Fehler beim Laden der Kunden';
        this.loading = false;
      }
    });
  }
}