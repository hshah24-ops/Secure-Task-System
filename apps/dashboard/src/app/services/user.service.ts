import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  email: string;
  role: { id: number; name: string };
  organization?: { id: number; name?: string };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  createUser(email: string, password: string, roleId: number): Observable<User> {
    return this.http.post<User>(this.baseUrl, { email, password, roleId });
  }
}