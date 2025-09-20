import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Navigation } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.css']
})
export class TaskEditComponent implements OnInit {
  task: any = {};
  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    // First, check if task was passed via navigation state
    const nav: Navigation | null = this.router.getCurrentNavigation();
    const passedTask = nav?.extras?.state?.['task'];

    if (passedTask) {
      console.log('Loaded task from state:', passedTask);
      this.task = passedTask;
    } else {
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'new') {
        console.warn('No task passed, falling back to empty object for editing');
        this.task = { id: id }; // minimal placeholder to allow editing
      } else {
        console.log('Creating a new task...');
        this.task = {};
      }
    }
  }

  save() {
    if (this.task.id) {
      // Update existing task
      console.log('Updating existing task...', this.task);
      this.http.put(`${this.apiUrl}/${this.task.id}`, this.task).subscribe(() => {
        this.router.navigate(['/tasks']);
      });
    } else {
      // Create new task
      console.log('Creating new task...', this.task);
      this.http.post(this.apiUrl, this.task).subscribe(() => {
        this.router.navigate(['/tasks']);
      });
    }
  }
}