import { Component, OnInit } from '@angular/core';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: User[] = [];
  email = '';
  password = '';
  roleId = 0; 
  loading = false;
  error = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: users => this.users = users,
      error: err => this.error = 'Error fetching users'
    });
  }

  createUser() {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return;
    }
    this.loading = true;
    this.userService.createUser(this.email, this.password, this.roleId).subscribe({
      next: user => {
        console.log('User created:', user);
        alert(`User ${user.email} created successfully!`);
        this.users.push(user); // update the list immediately
        this.resetForm (); //reset
        this.error = '';
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || 'Error creating user';
        this.loading = false;
      }
    });
  }

  resetForm() {
  this.email = '';
  this.password = '';
  this.roleId = 0; // default to "Select Role"
  this.error = '';
  }
}