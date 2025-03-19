import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AddEmployeeComponent } from "./add-employee/add-employee.component";
import { LoginComponent } from "./login/login.component";
import { ManagerDashboardComponent } from "./manager-dashboard/manager-dashboard.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AddEmployeeComponent, LoginComponent, ManagerDashboardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sample-role-authentication';
}
