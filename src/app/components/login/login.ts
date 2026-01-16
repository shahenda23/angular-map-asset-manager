import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Essential for the form to work
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginData = { username: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        console.log('Login Success!', res);
        this.router.navigate(['/map']); // Send user to map after login
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
        console.error(err);
      }
    });
  }

  onRegisterRedirect() {
    this.router.navigate(['/register']); // Navigate to the registration page
  }
}