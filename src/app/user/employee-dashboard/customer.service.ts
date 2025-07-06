import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
  customer_id: number;
  street: string;
  house_number: number;
  zipcode: string;
  country: string;
  city: string;
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
      street: customer.street,
      house_number: customer.house_number,
      zipcode: customer.zipcode,
      country: customer.country,
      city: customer.city
    }).subscribe({
      error: () => {
        alert('Fehler beim Aktualisieren des Kunden.');
      }
    });
  }
}
