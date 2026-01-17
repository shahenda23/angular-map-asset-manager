import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  registerData = {
    username: '',
    email: '',
    password: ''
  };
  
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  hasNumber(): boolean {
    return /[0-9]/.test(this.registerData.password);
  }

  hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.registerData.password);
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.registerData.password);
  }

  isPasswordStrong(): boolean {
    const p = this.registerData.password;
    return p.length >= 6 && this.hasNumber() && this.hasSpecialChar() && this.hasUppercase();
  }

  onRegister() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isSubmitting = true;

    const payload = {
      username: this.registerData.username.trim(),
      email: this.registerData.email.trim(),
      password: this.registerData.password
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = 'Registration successful! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/']), 2000);
      },
      error: (err) => {
        this.isSubmitting = false;

        if (Array.isArray(err.error)) {
          this.errorMessage = err.error.map((e: any) => e.description || e.message).join('. ');
        } else if (err.error?.errors) {
          const errors = err.error.errors;
          this.errorMessage = Object.values(errors).flat().join('. ');
        } else {
          this.errorMessage = 'Registration failed. The username or email may already be in use.';
        }
      }
    });
  }

  onLoginRedirect() {
    this.router.navigate(['/']);
  }
}