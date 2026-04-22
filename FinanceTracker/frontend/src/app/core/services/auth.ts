import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of } from 'rxjs';
import { User, LoginRequest, RegisterRequest } from '../models/user';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);
  private apiUrl = environment.apiUrl + '/auth';

  user = this.currentUser.asReadonly();
  isLoggedIn = computed(() => !!this.currentUser());

  constructor(private http: HttpClient) {
    const stored = this.getStoredUser();
    if (stored) {
      this.currentUser.set(stored);
    }
  }

  login(req: LoginRequest): Observable<boolean> {
    return this.http.post<{ access: string; refresh: string }>(
      `${this.apiUrl}/login/`, { username: req.username, password: req.password }
    ).pipe(
      tap(tokens => this.storeTokens(tokens)),
      tap(() => this.loadProfile()),
      map(() => true),
      catchError(() => of(false))
    );
  }

  register(req: RegisterRequest): Observable<boolean> {
    return this.http.post<any>(
      `${this.apiUrl}/register/`,
      {
        username: req.username,
        email: req.email,
        password: req.password,
        confirm_password: req.confirm_password,
      }
    ).pipe(
      tap(() => {
        this.http.post<{ access: string; refresh: string }>(
          `${this.apiUrl}/login/`, { username: req.username, password: req.password }
        ).subscribe(tokens => {
          this.storeTokens(tokens);
          this.loadProfile();
        });
      }),
      map(() => true),
      catchError(err => {
        console.error('Register error:', err.error);
        return of(false);
      })
    );
  }

  loadProfile(): void {
    this.http.get<any>(`${this.apiUrl}/profile/`).subscribe(user => {
      const u: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name || user.username,
        last_name: user.last_name || '',
      };
      this.currentUser.set(u);
      this.storeUser(u);
    });
  }

  logout(): void {
    this.currentUser.set(null);
    try {
      sessionStorage.removeItem('ft_user');
      sessionStorage.removeItem('ft_tokens');
    } catch {}
  }

  private storeTokens(tokens: { access: string; refresh: string }): void {
    try { sessionStorage.setItem('ft_tokens', JSON.stringify(tokens)); } catch {}
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
}