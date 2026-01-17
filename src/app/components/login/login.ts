import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  isLoading = false; 

  constructor(
    private authService: AuthService, 
    private router: Router,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get usernameControl() {
    return this.loginForm.get('username');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  onLogin() {
  this.errorMessage = '';

  if (this.loginForm.invalid) {
    this.errorMessage = 'Please fill in all fields correctly';
    return;
  }

  this.isLoading = true;
  this.loginForm.disable(); 

  this.authService.login(this.loginForm.value).subscribe({
    next: (res) => {
      console.log('Login Success!', res);
      this.isLoading = false;
      this.loginForm.enable(); 
      alert('Login successful! Welcome back.');
      this.router.navigate(['/map']);
    },
    error: (err) => {
      this.isLoading = false;
      this.loginForm.enable(); 
      console.error('Login error:', err);
      
      if (err.status === 401) {
        this.errorMessage = 'Invalid username or password';
      } else if (err.status === 0) {
        this.errorMessage = 'Cannot connect to server. Please check if the API is running.';
      } else if (err.status === 500) {
        this.errorMessage = 'Server error. Please try again later.';
      } else {
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
      }
    }
  });
}

  onRegisterRedirect() {
    this.router.navigate(['/register']);
  }
}