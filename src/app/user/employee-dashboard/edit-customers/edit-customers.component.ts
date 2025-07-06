import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Customer, CustomerService } from '../customer.service';
import { AuthService } from '../../../auth.service';
import { combineLatest, Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-customers.component.html',
  styleUrls: ['./edit-customers.component.css'],
  standalone: true,
})
export class EditCustomersComponent implements OnInit {
  customer: Customer | null = null;
  error: string = '';

  currentUser: any = null;
  isEmployee = false;

  private authSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.checkSession();

    this.authSub = combineLatest([
      this.authService.isLoggedIn$,
      this.authService.isEmployee$,
    ]).subscribe(([loggedIn, isEmployee]) => {
      this.isEmployee = isEmployee;

      if (loggedIn && isEmployee && !this.currentUser) {
        this.loadUserDetails();
      }
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error = 'Ungültige Kunden-ID.';
      return;
    }
    this.loadCustomer(id);
  }

  loadUserDetails() {
    this.authService.fetchUserDetails().subscribe({
      next: (details) => {
        this.currentUser = details;
        this.authService.setLogin(details);
      },
      error: (err) => {
        console.error('Fehler beim Laden der User-Details', err);
      },
    });
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
        this.error = 'Fehler beim Laden des Kunden.';
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

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }
}