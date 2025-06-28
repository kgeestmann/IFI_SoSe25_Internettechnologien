import { Component } from '@angular/core';
import { LoginServiceService } from '../../login/login-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  standalone: true,
})

export class ProfileComponent {
  constructor(private loginService: LoginServiceService) {}

  get user() {
    return this.loginService.currentUser; 
  }
}
