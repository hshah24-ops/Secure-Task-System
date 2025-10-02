import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

interface JwtPayload {
  id: number;
  email: string;
  roleId: number;
  organizationId: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'access_token';

  constructor(private http: HttpClient, private router:Router) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<{ access_token: string }>(
      `http://localhost:3000/api/auth/login`,
      { email, password }
    ).pipe(
      tap(res => {
        if (res.access_token) {
          this.setToken(res.access_token);
        }
      })
    );
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  getRoleId(): number | null {
    const payload = this.getPayload();
    return payload?.roleId ?? null;
  }

  getRoleName(): string | null {
    const roleId = this.getRoleId();
    if (roleId === 1) return 'Owner';
    if (roleId === 2) return 'Admin';
    if (roleId === 3) return 'Viewer';
    return null;
  }

  isOwnerOrAdmin(): boolean {
  const roleId = this.getRoleId();
  return roleId === 1 || roleId === 2; // Owner or Admin
  }

  canCreateTask(): boolean {
    const roleId = this.getRoleId();
    return roleId === 1 || roleId === 2; // Owner or Admin
  }

  canCreateUser(): boolean {
    const roleId = this.getRoleId();
    return roleId === 1 || roleId === 2; // Owner or Admin
  }

  private getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson);
    } catch (e) {
      console.error('Invalid JWT', e);
      return null;
    }
  }
}