import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouchdbService } from '../couchdb.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tl-dashboard',
  templateUrl: './tl-dashboard.component.html',
  styleUrls: ['./tl-dashboard.component.css'],
  standalone: true,
  imports: [HttpClientModule, RouterModule, CommonModule, ReactiveFormsModule],
  providers: [CouchdbService]
})
export class TLDashboardComponent {
  assignTaskForm: FormGroup;
  employees: any[] = []; // Employees under this TL
  assignedTasks: any[] = []; // Tasks assigned by the manager
  tlId: string | null = null; // Fix: Initialize tlId properly

  constructor(readonly fb: FormBuilder, readonly couchdbService: CouchdbService, readonly router: Router) {
    this.assignTaskForm = this.fb.group({
      employeeId: ['', Validators.required],
      taskTitle: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getTlId(); // Retrieve TL ID first
  }

  getEmployeeName(employeeId: string): string {
    const employee = this.employees.find(emp => emp._id === employeeId);
    return employee ? employee.data?.name : 'Unknown';
  }
  
  // ✅ Fetch TL ID from localStorage
  getTlId() {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.data.role === 'TL' && user._id) {
        this.tlId = user._id;
        console.log('TL ID Retrieved:', this.tlId);
        this.loadEmployees();
        this.loadAssignedTasks();
      } else {
        console.error('Error: TL ID not found in localStorage.');
        alert('Invalid access. Redirecting to login.');
        this.router.navigate(['/login']);
      }
    } else {
      console.error('Error: No user found in localStorage.');
      alert('Session expired. Please log in again.');
      this.router.navigate(['/login']);
    }
  }

  loadEmployees() {
    if (!this.tlId) {
      console.error("❌ Error: TL ID is undefined or null.");
      return;
    }
  
    console.log("ℹ️ Fetching employees for Team Lead ID:", this.tlId);
  
    this.couchdbService.getEmployeesByTL(this.tlId).subscribe({
      next: (response) => {
        console.log("✅ Raw Response:", response);
  
        if (response?.rows?.length) {
          this.employees = response.rows
            .filter((row: any) => row.doc?.type === 'employee') // Ensure only employee docs
            .map((row: any) => row.doc);
  
          console.log("✅ Mapped Employees:", this.employees);
        } else {
          this.employees = [];
          console.warn("⚠️ No employees found for this TL.");
        }
      },
      error: (error) => {
        console.error("❌ Error fetching employees:", error);
      }
    });
  }
  
  

  // ✅ Fetch tasks assigned by the manager
  loadAssignedTasks() {
    if (!this.tlId) return;

    this.couchdbService.queryTasksByManager(this.tlId).subscribe({
      next: (response) => {
        console.log('Assigned Tasks:', response);
        this.assignedTasks = Array.isArray(response) ? response : [];
      },
      error: (error) => {
        console.error('Error fetching assigned tasks:', error);
      }
    });
  }

  // ✅ Assign task to an employee
  assignTask() {
    if (this.assignTaskForm.invalid || !this.tlId) {
      console.error('Form is invalid or TL ID is missing.');
      return;
    }

    const task = {
      _id: `task_by_tl_${this.tlId}_${new Date().getTime()}`,
      type: 'task',
      data: {
        employeeId: this.assignTaskForm.value.employeeId,
        title: this.assignTaskForm.value.taskTitle,
        description: this.assignTaskForm.value.description,
        dueDate: this.assignTaskForm.value.dueDate,
        status: 'Pending',
        tlId: this.tlId
      }
    };

    console.log('Assigning Task:', task);

    this.couchdbService.createDocument(task).subscribe({
      next: (response) => {
        console.log('Task Created Successfully:', response);
        alert('Task Assigned Successfully');
        this.assignTaskForm.reset();
        this.loadAssignedTasks();
      },
      error: (error) => {
        console.error('Error creating task:', error);
      }
    });
  }
}
