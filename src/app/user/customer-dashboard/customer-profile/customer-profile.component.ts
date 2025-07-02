import { Component } from '@angular/core';
import { LoginServiceService } from '../../login/login-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './customer-profile.component.html',
  styleUrl: './customer-profile.component.css',
  standalone: true,
})

export class CustomerProfileComponent {
  constructor(private loginService: LoginServiceService) {}

  get user() {
    return this.loginService.currentUser; //TODO: an neues Login anpassen
  }
}
