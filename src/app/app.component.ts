import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { ProductListComponent } from './products/product-list/product-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationComponent } from './shared/navigation/navigation.component'; // <--- Import hinzufügen
import { AuthService } from './auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    ProductListComponent,
    NavigationComponent,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'project';
  constructor(private authService: AuthService) {
    this.authService.checkSession();
  }
}