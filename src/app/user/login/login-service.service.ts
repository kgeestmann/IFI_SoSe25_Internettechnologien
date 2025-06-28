import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal, computed, } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../model/models';



@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  constructor(private http: HttpClient) { }

  readonly currentUser = signal<User | null>(null);

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly isCustomer  = computed(() => this.currentUser()?.role === 'Kunde');
  readonly isEmployee  = computed(() => this.currentUser()?.role === 'Mitarbeiter');

  login(email: string, password: string): Observable<User> {
  const dummyUser: User = {
    user_id: 123,
    email:"Frieda@nauermann.de",
    password:"***REMOVED***",
    firstname: 'Test',
    lastname: 'User',
    role: 'Kunde'
  };
  this.currentUser.set(dummyUser);
  return of(dummyUser); 
  }

  logout(): void {
    this.currentUser.set(null);
  }

}
