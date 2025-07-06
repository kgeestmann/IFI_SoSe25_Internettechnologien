import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  customer_id: number;
  billing_address_id: number;
  shipping_address_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/api/get-customers');
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`/api/get-customer/${id}`);
  }

  editCustomer(customer: Customer | null): void {
    if (customer == null) {
      return;
    }
    this.http.post('/api/edit-customer', {
      customer_id: customer.customer_id,
      billing_address_id: customer.billing_address_id,
      shipping_address_id: customer.shipping_address_id
    }).subscribe({
      error: () => {
        alert('Fehler beim Aktualisieren des Kunden.');
      }
    });
  }
}
