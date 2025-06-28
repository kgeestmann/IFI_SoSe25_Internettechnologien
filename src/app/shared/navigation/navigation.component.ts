import { Component, Input } from '@angular/core';
import {CommonModule } from '@angular/common'; // NgFor ist im CommonModule enthalten
import { RouterLink } from '@angular/router';
import { LoginServiceService } from '../../user/login/login-service.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']

})

export class NavigationComponent {
  constructor(public auth: LoginServiceService) {}

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }
  get isCustomer() {
    return this.auth.isCustomer();
  }
  get isEmployee() {
    return this.auth.isEmployee();
  }

  logout() {
    this.auth.logout();
  }
}
