import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Navigation } from '@angular/router';
//import { HttpClient } from '@angular/common/http';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.css']
})
export class TaskEditComponent implements OnInit {
  task: any = {};
  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
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
      this.taskService.updateTask(this.task.id, this.task).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => console.error('Error updating task:', err)
      });
    } else {
      this.taskService.createTask(this.task).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => console.error('Error creating task:', err)
      });
    }
  }
}