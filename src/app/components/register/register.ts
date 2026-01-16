import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  registerData = { username: '', password: '', email: '' };
  errorMessage = '';
  constructor(private authService: AuthService, private router: Router) { }

  onRegister() {
    this.authService.register(this.registerData).subscribe({
      next: (res) => {
        console.log('Registration Success!', res);
        this.router.navigate(['/']); // Redirect to login after successful registration
      },
      error: (err) => {
        this.errorMessage = 'Registration failed. Please try again.';
        console.error(err);
      }
    });
  }

  onLoginRedirect() {
    this.router.navigate(['/']);
  }
}
