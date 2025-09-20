import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Task } from '../../../../../../libs/data/src/lib/task.interface';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];

  // UI states
  searchText = '';
  sortKey: keyof Task = 'title';
  sortAsc = true;
  selectedCategory = '';

  private apiUrl = 'http://localhost:3000/api/tasks';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Task[]>(this.apiUrl).subscribe(data => {
      this.tasks = data;
      this.filteredTasks = [...data];
    });
  }

  
 
  // Filter by search text and category
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

  // Sort tasks
  sortTasks() {
    this.filteredTasks.sort((a, b) => {
      const valA = (a[this.sortKey] ?? '').toString().toLowerCase();
      const valB = (b[this.sortKey] ?? '').toString().toLowerCase();
      return this.sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }

  // Toggle sort order
  toggleSort(key: keyof Task) {
    if (this.sortKey === key) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortKey = key;
      this.sortAsc = true;
    }
    this.sortTasks();
  }

  // Reset filter
  resetFilters() {
    this.searchText = '';
    this.selectedCategory = '';
    this.filteredTasks = [...this.tasks];
    this.sortTasks();
  }

  // Handle drag and drop event
  drop(event: CdkDragDrop<Task[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    // Optional: send reordered task list to backend here
    console.log('New order:', this.tasks);
  }

  // Delete task
  deleteTask(taskId: number) {
  if (confirm('Are you sure you want to delete this task?')) {
    this.http.delete(`${this.apiUrl}/${taskId}`).subscribe(() => {
      // Refresh the list after deletion
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.filteredTasks = this.filteredTasks.filter(t => t.id !== taskId);
     });
    }
  }
}