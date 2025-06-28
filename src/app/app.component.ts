import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationComponent } from './shared/navigation/navigation.component'; // <--- Import hinzufügen
import { AuthService } from './auth.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
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