import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Task } from '@secure-task-manager/auth';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  searchText = '';
  sortKey: keyof Task = 'title';
  sortAsc = true;
  selectedCategory = '';
  private routerSubscription?: Subscription;

  constructor(
    private taskService: TaskService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.loadTasks();
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }
  
  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.filteredTasks = [...data];
        console.log('Tasks loaded:', this.tasks.length);
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      }
    });
  }

  // Rest of your methods stay exactly the same
  filterTasks() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        task.description?.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesCategory = this.selectedCategory
        ? task.category === this.selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    });
    this.sortTasks();
  }

  sortTasks() {
    this.filteredTasks.sort((a, b) => {
      const valA = (a[this.sortKey] ?? '').toString().toLowerCase();
      const valB = (b[this.sortKey] ?? '').toString().toLowerCase();
      return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  toggleSort(key: keyof Task) {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
    this.sortTasks();
  }

  resetFilters() {
    this.searchText = '';
    this.selectedCategory = '';
    this.filteredTasks = [...this.tasks];
    this.sortTasks();
  }

  drop(event: CdkDragDrop<Task[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    console.log('New order:', this.tasks);
  }

  deleteTask(taskId: number) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.tasks = this.tasks.filter(t => t.id !== taskId);
          this.filteredTasks = this.filteredTasks.filter(t => t.id !== taskId);
        },
        error: (err) => {
          console.error('Error deleting task:', err);
        }
      });
    }
  }
}