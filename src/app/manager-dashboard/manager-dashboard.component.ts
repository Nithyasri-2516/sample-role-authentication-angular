import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouchdbService } from '../couchdb.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule, NgFor, NgForOf } from '@angular/common';
import { randomUUID } from 'crypto';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,HttpClientModule,CommonModule,NgForOf,RouterModule,HttpClientModule],
  providers:[CouchdbService,HttpClient],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent {
  assignTaskForm: FormGroup;
  tls: any[] = []; // Team Leads list
  assignedTasks: any[] = []; // Tasks assigned by the manager
   managerId: string = '2'; // Replace with dynamic manager ID

  constructor(private fb: FormBuilder, private couchdbService: CouchdbService) {
    this.assignTaskForm = this.fb.group({
      tlId: ['', Validators.required],
      taskTitle: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTLs();
    this.loadAssignedTasks();
  }

  // Fetch Team Leads under this Manager
  loadTLs() {
    this.couchdbService.getEmployeesByRole('TL').subscribe(
      (response) => {
        if (response.rows && Array.isArray(response.rows)) {
          this.tls = response.rows.map((row: any) => row.doc);
        } else {
          this.tls = [];
        }
      },
      (error) => console.error('Error fetching TLs:', error)
    );
  }

  // Assign Task to TL
  assignTask() {
    if (this.assignTaskForm.invalid) return;
  
    const uuid = crypto.randomUUID(); // Generate unique ID
    const task = {
      _id: `tasksbymanager_2_${uuid}`, // Updated ID format
      type: 'task',
      data:{
      tlId: this.assignTaskForm.value.tlId, // Task assigned to TL
      title: this.assignTaskForm.value.taskTitle,
      description: this.assignTaskForm.value.description,
      dueDate: this.assignTaskForm.value.dueDate,
      status: 'Pending'
      }
    };
  
    this.couchdbService.createDocument(task).subscribe(
      () => {
        alert('Task Assigned Successfully');
        this.assignTaskForm.reset();
        this.loadAssignedTasks();
      },
      (error) => console.error('Error assigning task:', error)
    );
  }
  

  // Load tasks assigned by the manager
  loadAssignedTasks() {
    this.couchdbService.queryTasksByManager(this.managerId).subscribe(
      (response) => {
        if (response && Array.isArray(response)) {
          this.assignedTasks = response;
        } else {
          this.assignedTasks = [];
        }
      },
      (error) => console.error('Error fetching assigned tasks:', error)
    );
  }
}
