import { Component, Input } from '@angular/core';
import {CommonModule } from '@angular/common'; // NgFor ist im CommonModule enthalten
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']

})
export class NavigationComponent {
  @Input() isLoggedIn = false;
  @Input() isCustomer = false;
  @Input() isEmployee = false;

  logout() {
    // Hier später AuthService.logout() aufrufen
    alert('Logout (Demo)');
  }
}
