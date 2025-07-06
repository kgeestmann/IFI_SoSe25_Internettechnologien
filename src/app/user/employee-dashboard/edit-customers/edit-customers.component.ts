import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Customer, CustomerService} from '../customer.service';

@Component({
  selector: 'app-edit-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-customers.component.html',
  styleUrl: './edit-customers.component.css',
  standalone: true,
})
export class EditCustomersComponent implements OnInit {
  customer: Customer | null = null;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error = 'Ungültige Kunden-ID.';
      return;
    }
    this.loadCustomer(id);
  }

  loadCustomer(id: number): void {
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        if (customer) {
          this.customer = customer;
          this.error = '';
        } else {
          this.error = 'Kunde nicht gefunden.';
        }
      },
      error: () => {
        this.error = 'Fehler beim Laden des Kunde.';
      },
    });
  }

  editCustomer(): void {
    this.customerService.editCustomer(this.customer);
    this.goBack();
  }

  goBack(): void {
    this.router.navigate(['/customers-admin']);
  }
}
