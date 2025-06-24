import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProductListComponent } from './products/product-list/product-list.component';
import { NavigationComponent } from './shared/navigation/navigation.component'; // <--- Import hinzufügen

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    ProductListComponent,
    NavigationComponent // <--- NavigationComponent einbinden
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'project';
  // Diese Werte später dynamisch aus dem AuthService holen!
  isLoggedIn = false;
  isCustomer = false;
  isEmployee = false;
}