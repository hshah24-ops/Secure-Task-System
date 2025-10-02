import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent implements OnInit {
  logs: any[] = [];
  error = '';
  private apiUrl = 'http://localhost:3000/api/audit-log';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    // Only fetch logs if user is Owner/Admin
    if (this.authService.isOwnerOrAdmin()) {
      this.http.get<any[]>(this.apiUrl).subscribe({
        next: data => this.logs = data,
        error: err => this.error = 'Error fetching audit logs'
      });
    } else {
      this.error = 'Access denied: Only Owner/Admin can view audit logs';
    }
  }
}