import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CouchdbService } from '../couchdb.service';

export interface EmployeeModel {
  _id?: string;
  _rev?: string;
  data: {
    name: string;
    empid: number;
    email: string;
    password: string;
    role: 'Manager' | 'TL' | 'Employee';
    managerId?: string; // For TLs
    tlId?: string; // For Employees
    type: string;
  };
}

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.css'],
  providers: [CouchdbService]
})
export class AddEmployeeComponent implements OnInit {
  employeeForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    empid: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    role: new FormControl('Employee', Validators.required),
    managerId: new FormControl(''), // For TLs
    tlId: new FormControl('') // For Employees
  });

  employees: EmployeeModel[] = [];
  managers: EmployeeModel[] = [];
  tls: EmployeeModel[] = [];
  showModal = false;

  constructor(private couchdbService: CouchdbService) {}
  ngOnInit() {
    this.loadManagers();
    this.loadTLs();
  }
  
  loadManagers() {
    this.couchdbService.getEmployeesByRole('Manager').subscribe(
      (response) => {
        this.managers = response.rows.map((row: { value: any; }) => row.value);
        console.log('Managers:', this.managers);
      },
      (error) => console.error('Error fetching managers:', error)
    );
  }
  
  loadTLs() {
    this.couchdbService.getEmployeesByRole('TL').subscribe(
      (response) => {
        this.tls = response.rows.map((row: { value: any; }) => row.value);
        console.log('TLs:', this.tls);
      },
      (error) => console.error('Error fetching TLs:', error)
    );
  }
  
  
  

  fetchEmployees() {
    this.couchdbService.queryDocuments().subscribe(
      (response) => {
        if (response.rows) {
          this.employees = response.rows.map((row: any) => row.value);
          console.log("All Employees:", this.employees);

          // Ensure data exists before filtering
          this.managers = this.employees.filter(emp => emp.data?.role === 'Manager');
          this.tls = this.employees.filter(emp => emp.data?.role === 'TL');

          console.log("Filtered Managers:", this.managers);
          console.log("Filtered TLs:", this.tls);
        }
      },
      (error) => {
        console.error('Error fetching employees:', error);
      }
    );
  }

  save() {
    if (this.employeeForm.valid) {
      const newEmployee: EmployeeModel = {
        _id: `employee_2_${this.employeeForm.value.empid}`,
        data: { ...this.employeeForm.value, type: 'employee' },
      };

      if (newEmployee.data.role === 'Manager') {
        newEmployee.data.managerId = ''; // No manager for a Manager
      }

      if (newEmployee.data.role === 'Employee') {
        newEmployee.data.managerId = ''; // Ensure Employees don't have a managerId
      }

      if (this.isEmpidUnique(newEmployee.data.empid)) {
        alert('Employee ID must be unique!');
        return;
      }

      this.couchdbService.createDocument(newEmployee).subscribe(
        (response) => {
          newEmployee._id = response.id;
          newEmployee._rev = response.rev;
          this.employees.push(newEmployee);
          alert('Employee saved successfully!');
          this.resetEmployeeForm();
          this.fetchEmployees();
        },
        (error) => {
          console.error('Error saving employee:', error);
          alert('Error saving employee. Employee ID must be unique.');
        }
      );
    } else {
      alert('Form is not valid. Please check the fields.');
    }
  }

  resetEmployeeForm() {
    this.employeeForm.reset();
    this.employeeForm.patchValue({ role: 'Employee' });
  }

  isEmpidUnique(empid: number): boolean {
    return this.employees.some(employee => employee.data.empid === empid);
  }


 
  isSideNavOpen = false;

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  toggleSideNav() {
    this.isSideNavOpen = !this.isSideNavOpen;
    const sideNav = document.querySelector('.sidenav');
    const mainContent = document.getElementById('main');
    if (this.isSideNavOpen) {
      sideNav?.classList.add('open');
      mainContent?.classList.add('sidenav-open');
    } else {
      sideNav?.classList.remove('open');
      mainContent?.classList.remove('sidenav-open');
    }
  }

}