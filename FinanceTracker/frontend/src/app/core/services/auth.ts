import { Injectable, signal, computed } from '@angular/core';
import { User, LoginRequest, RegisterRequest } from '../models/user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);

  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => !!this.currentUser());

  constructor() {
    const stored = this.getStoredUser();
    if (stored) {
      this.currentUser.set(stored);
    }
  }

  login(req: LoginRequest): boolean {
    const users = this.getUsers();
    const found = users.find(u => u.username === req.username);
    if (found) {
      found.token = 'mock-jwt-' + Date.now();
      this.currentUser.set(found);
      this.storeUser(found);
      return true;
    }
    return false;
  }

  register(req: RegisterRequest): boolean {
    const users = this.getUsers();
    if (users.find(u => u.username === req.username || u.email === req.email)) {
      return false;
    }
    const newUser: User = {
      id: users.length + 1,
      username: req.username,
      email: req.email,
      first_name: req.first_name,
      last_name: req.last_name,
      token: 'mock-jwt-' + Date.now()
    };
    users.push(newUser);
    this.storeUsers(users);
    this.currentUser.set(newUser);
    this.storeUser(newUser);
    return true;
  }

  logout(): void {
    this.currentUser.set(null);
    try { sessionStorage.removeItem('ft_user'); } catch {}
  }

  private getStoredUser(): User | null {
    try {
      const s = sessionStorage.getItem('ft_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  }

  private storeUser(u: User): void {
    try { sessionStorage.setItem('ft_user', JSON.stringify(u)); } catch {}
  }

  private getUsers(): User[] {
    try {
      const s = sessionStorage.getItem('ft_users');
      return s ? JSON.parse(s) : [
        { id: 1, username: 'demo', email: 'demo@example.com', first_name: 'Demo', last_name: 'User' }
      ];
    } catch {
      return [{ id: 1, username: 'demo', email: 'demo@example.com', first_name: 'Demo', last_name: 'User' }];
    }
  }

  private storeUsers(users: User[]): void {
    try { sessionStorage.setItem('ft_users', JSON.stringify(users)); } catch {}
  }
}
