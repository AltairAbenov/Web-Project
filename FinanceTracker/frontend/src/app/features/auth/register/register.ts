import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ICONS } from '../../../core/icons/icons';
import { SafeHtmlPipe } from '../../../core/pipes/safe-html.pipe';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, SafeHtmlPipe],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  username = '';
  email = '';
  firstName = '';
  lastName = '';
  password = '';
  passwordConfirm = '';
  error = signal('');
  iconWallet = ICONS.wallet;

  constructor(private auth: AuthService, private router: Router) {
    if (auth.isLoggedIn()) this.router.navigate(['/dashboard']);
  }

  submit(): void {
    if (!this.username || !this.email || !this.password || !this.passwordConfirm) {
      this.error.set('Fill in all required fields');
      return;
    }
    if (this.password !== this.passwordConfirm) {
      this.error.set('Passwords are not the same');
      return;
    }
    if (this.password.length < 4) {
      this.error.set('Password should be at least 4 symbols long');
      return;
    }
    this.error.set('');
    this.auth.register({
      username: this.username,
      email: this.email,
      password: this.password,
      confirm_password: this.passwordConfirm,
      first_name: this.firstName || this.username,
      last_name: this.lastName || '',
    }).subscribe(ok => {
      if (ok) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set('User with the same username or email already exists');
      }
    });
  }
}