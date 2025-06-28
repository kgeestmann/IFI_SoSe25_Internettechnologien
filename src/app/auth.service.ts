import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private isCustomerSubject = new BehaviorSubject<boolean>(false);
  isCustomer$ = this.isCustomerSubject.asObservable();

  private isEmployeeSubject = new BehaviorSubject<boolean>(false);
  isEmployee$ = this.isEmployeeSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post('/api/login', { email, password }, { withCredentials: true });
  }

  setLogin(role: string) {
    this.isLoggedInSubject.next(true);
    this.isCustomerSubject.next(role === 'customer');
    this.isEmployeeSubject.next(role === 'employee');
  }

  logout() {
    this.http.post('/api/logout', {}, { withCredentials: true }).subscribe();
    this.isLoggedInSubject.next(false);
    this.isCustomerSubject.next(false);
    this.isEmployeeSubject.next(false);
  }

  checkSession() {
    this.http.get<{ user?: any }>('/api/me', { withCredentials: true }).subscribe({
      next: (res) => {
        if (res.user) {
          this.setLogin(res.user.role);
        } else {
          this.isLoggedInSubject.next(false);
          this.isCustomerSubject.next(false);
          this.isEmployeeSubject.next(false);
        }
      },
      error: () => {
        this.isLoggedInSubject.next(false);
        this.isCustomerSubject.next(false);
        this.isEmployeeSubject.next(false);
      }
    });
  }
}
