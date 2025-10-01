import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Navigation } from '@angular/router';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.css']
})
export class TaskEditComponent implements OnInit {
  task: any = {};
  isEdit = false;  // new: to track if creating or updating

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    //const nav: Navigation | null = this.router.getCurrentNavigation();
    //const passedTask = nav?.extras?.state?.['task'];
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new') {
      this.isEdit = true;  //existing task
      console.log('Fetching task with ID:', id);

      this.taskService.getTask(+id).subscribe({
        next: task => {
           console.log('Task received from backend:', task);
           this.task = task;
           console.log('this.task after assignment:', this.task);
        },
        error: err => console.error('Error fetching task:', err)
      });
    } else {
      console.log('Creating a new task...');
      this.isEdit = false;
      this.task = {};
    }
  }

  save() {
    console.log('=== SAVE FUNCTION CALLED ===');
    console.log('isEdit:', this.isEdit);
    console.log('task object:', this.task);
    console.log('task.id:', this.task.id);
    console.log('typeof task.id:', typeof this.task.id);
    console.log('Saving task:', this.task);

    if (this.isEdit) {
      // Covert ID to number to prevent invalid syntax
      const taskId = Number(this.task.id);
      if (isNaN(taskId)) {
        console.error('Invalid task ID:', this.task.id);
        return;
      }

      // Update existing task
      console.log('Updating task:', this.task);
      this.taskService.updateTask(taskId, this.task).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: err => console.error('Error updating task:', err)
      });
    } else {
      // Create new task
      console.log('Creating task:', this.task);
      this.taskService.createTask(this.task).subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: err => console.error('Error creating task:', err)
      });
    }
  }
}