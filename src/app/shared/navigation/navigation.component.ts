import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, CommonModule, ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})


export class NavigationComponent {
  isLoggedIn$;
  isCustomer$;
  isEmployee$;

  constructor(private authService: AuthService, private router: Router) {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isCustomer$ = this.authService.isCustomer$;
    this.isEmployee$ = this.authService.isEmployee$;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/products']);
  }
}
