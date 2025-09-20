import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html'
})
export class AuditLogComponent implements OnInit {
  logs: any[] = [];
  private apiUrl = 'http://localhost:3000/api/audit-log';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(this.apiUrl).subscribe(data => this.logs = data);
  }
}