import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage = '';
  isSubmitting = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get usernameControl() {
    return this.registerForm.get('username');
  }

  get emailControl() {
    return this.registerForm.get('email');
  }

  get passwordControl() {
    return this.registerForm.get('password');
  }

  onRegister() {
    if (!this.registerForm.valid) {
      this.errorMessage = 'Please fix the errors in the form';
      return;
    }

    this.isSubmitting = true;
    const formValue = this.registerForm.value;

    this.authService.register({
      username: formValue.username,
      email: formValue.email,
      password: formValue.password
    }).subscribe({
      next: (res) => {
        console.log('Registration Success!', res);
        this.router.navigate(['/']); 
      },
      error: (err) => {
        this.errorMessage = 'Registration failed. Please try again.';
        console.error(err);
        this.isSubmitting = false;
      }
    });
  }

  onLoginRedirect() {
    this.router.navigate(['/']);
  }
}
