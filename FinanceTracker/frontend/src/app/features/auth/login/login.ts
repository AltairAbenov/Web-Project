import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  error = signal('');

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  submit(): void {
    if (!this.username || !this.password) {
      this.error.set('Fill all the fields');
      return;
    }
    const ok = this.auth.login({ username: this.username, password: this.password });
    if (ok) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error.set('Invalid login or password. Try: demo');
    }
  }
}
