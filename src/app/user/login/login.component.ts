import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginServiceService } from './login-service.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']          // <‑‑ „s“
})
export class LoginComponent {

  loginModel = { email: '', password: '' };

  constructor(
    private loginService: LoginServiceService,
    private router: Router                       // falls du weiterleiten willst
  ) {}

  /** Wird vom Formular (ngSubmit) oder Button‑(click) aufgerufen */
  onLogin(): void {
    this.loginService
        .login(this.loginModel.email, this.loginModel.password)
        .subscribe({
          next: () => {
            console.log('Login erfolgreich');
            this.router.navigate(['/profile'], { replaceUrl: true });          },
          error: err => console.error('Login fehlgeschlagen', err)
        });
  }
}
