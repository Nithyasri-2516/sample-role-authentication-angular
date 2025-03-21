import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouchdbService } from '../couchdb.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tl-dashboard',
  templateUrl: './tl-dashboard.component.html',

  styleUrls: ['./tl-dashboard.component.css'],
  standalone:true,
  imports:[HttpClientModule,RouterModule,CommonModule,ReactiveFormsModule],
  providers:[CouchdbService]
})
export class TLDashboardComponent {
  assignTaskForm: FormGroup;
  employees: any[] = []; // Employees under this TL
  assignedTasks: any[] = []; // Tasks assigned by the manager
  tlId: string = '3'; // Replace with the logged-in TL's ID (should be dynamically fetched)

  constructor(readonly fb: FormBuilder, readonly couchdbService: CouchdbService) {
    this.assignTaskForm = this.fb.group({
      employeeId: ['', Validators.required],
      taskTitle: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAssignedTasks();
  }

  // Fetch employees under the current TL
  loadEmployees() {
    this.couchdbService.getEmployeesByTL(this.tlId).subscribe(
      (response) => {
        console.log('Fetched Employees:', response);  // Debugging log
        if (response.rows && Array.isArray(response.rows)) {
          this.employees = response.rows.map((row: any) => row.doc);
          console.log('Mapped Employees:', this.employees);  // Debugging log
        } else {
          this.employees = [];
        }
      },
      (error) => {
        console.error('Error fetching employees:', error);
      }
    );
  }
  
  loadAssignedTasks() {
    this.couchdbService.queryTasksByManager(this.tlId).subscribe(
      (response) => {
        console.log('Assigned Tasks:', response);  // Debugging log
        if (response && Array.isArray(response)) {
          this.assignedTasks = response;
          console.log('Mapped Assigned Tasks:', this.assignedTasks);  // Debugging log
        } else {
          this.assignedTasks = [];
        }
      },
      (error) => {
        console.error('Error fetching assigned tasks:', error);
      }
    );
  }
  
  
  // Assign task to an employee
  assignTask() {
    if (this.assignTaskForm.invalid) {
      console.error("Form is invalid:", this.assignTaskForm.value);
      return;
    }
  
    const task = {
      _id: `task_by_tl_${this.tlId}_${new Date().getTime()}`,
      type: 'task', // ✅ Correct type
      data: {
        employeeId: this.assignTaskForm.value.employeeId,
        title: this.assignTaskForm.value.taskTitle,
        description: this.assignTaskForm.value.description,
        dueDate: this.assignTaskForm.value.dueDate,
        status: 'Pending',
        tlId: this.tlId // ✅ Ensure this matches your query
      }
    };
  
    console.log("Assigning Task:", task); // Debug log
  
    this.couchdbService.createDocument(task).subscribe(
      (response) => {
        console.log("Task Created Successfully:", response);
        alert('Task Assigned Successfully');
        this.assignTaskForm.reset();
        this.loadAssignedTasks();
      },
      (error) => {
        console.error('Error creating task:', error);
      }
    );
  }
  
}
