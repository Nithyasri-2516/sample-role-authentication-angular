import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouchdbService } from '../couchdb.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgIf, HttpClientModule, RouterModule],
  providers: [CouchdbService, HttpClient],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // ✅ Fixed styleUrls property
})
export class LoginComponent {

  // Hardcoded Admin Credentials
  private readonly ADMIN_EMAIL = 'admin@example.com';
  private readonly ADMIN_PASSWORD = 'Admin@123';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });

  errorMessage: string = '';
  
  constructor(readonly couchdbService: CouchdbService, readonly router: Router) {}

  login() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
  
      // Check if the entered credentials match the hardcoded Admin credentials
      if (email === this.ADMIN_EMAIL && password === this.ADMIN_PASSWORD) {
        // Simulate an Admin user object
        const adminUser = { data: { role: 'Admin', email: this.ADMIN_EMAIL } };
        localStorage.setItem('user', JSON.stringify(adminUser)); // Store Admin session
        console.log('Login successful');
        
        alert('Login successful, redirecting to admin page');
        this.router.navigate(['/admin-dashboard']);
        return;
      }
  
      // If not Admin, proceed with CouchDB authentication
      this.couchdbService.login(email!, password!).subscribe({
        next: (user) => {
          if (!user || !user.data.role) {
            this.errorMessage = 'Invalid user data';
            return;
          }
  
          localStorage.setItem('user', JSON.stringify(user)); // Store user session

          // ✅ Store TL ID for later use in tl-dashboard.component.ts
          if (user.data.role === 'TL' && user._id) {
            localStorage.setItem('tlId', user._id);
          }

          switch (user.data.role) {
            case 'Manager':
              this.router.navigate(['/manager-dashboard']);
              break;
            case 'TL':
              this.router.navigate(['/tl-dashboard']);
              break;
            case 'Employee':
              this.router.navigate(['/employee-dashboard']);
              break;
            default:
              this.errorMessage = 'Unauthorized role';
          }
        },
        error: (error) => {
          this.errorMessage = 'Invalid email or password';
          console.error('Login Error:', error);
        }
      });
    }
  }
}
