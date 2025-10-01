import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = 'http://localhost:3000/api/tasks';

  // BehaviorSubject to hold current task list
  private tasksSubject = new BehaviorSubject<any[]>([]);
  tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTasks(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      tap(tasks => this.tasksSubject.next(tasks))
    );
  }

  getTask(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  createTask(task: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, task).pipe(
      tap(newTask => {
        const current = this.tasksSubject.value;
        this.tasksSubject.next([...current, newTask]);
      })
    );
  }

  updateTask(id: number, task: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, task).pipe(
      tap(updatedTask => {
        const current = this.tasksSubject.value;
        const index = current.findIndex(t => t.id === updatedTask.id);
        if (index > -1) current[index] = updatedTask;
        this.tasksSubject.next([...current]);
      })
    );
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const current = this.tasksSubject.value.filter(t => t.id !== id);
        this.tasksSubject.next(current);
      })
    );
  }
}