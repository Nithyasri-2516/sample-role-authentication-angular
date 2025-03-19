import { Routes } from '@angular/router';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { LoginComponent } from './login/login.component';
import { ManagerDashboardComponent } from './manager-dashboard/manager-dashboard.component';
import { TLDashboardComponent } from './tl-dashboard/tl-dashboard.component';


export const routes: Routes = [
    {path:'',component:LoginComponent},
    {path:'admin-dashboard',component:AddEmployeeComponent},
   
    {path:'manger-dashboard',component:ManagerDashboardComponent},
    {path:'tl-dashboard',component:TLDashboardComponent}
];
