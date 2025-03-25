import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CouchdbService {
  readonly baseURL = 'https://192.168.57.185:5984/role-based-authentication';
  readonly userName = 'd_couchdb';
  readonly password = 'Welcome#2';

 readonly headers  = new HttpHeaders({
    'Authorization': 'Basic ' + btoa(this.userName + ':' + this.password),
    'Content-Type': 'application/json',
  });

  constructor(readonly http: HttpClient) { }

  
  login(email: string, password: string): Observable<any> {
    const viewUrl = `${this.baseURL}/_design/task-management/_view/user_by_email?key="${email}"`;

    return this.http.get<any>(viewUrl, { headers: this.headers }).pipe(
      map(response => {
        console.log(' CouchDB Full Response:', JSON.stringify(response, null, 2));

        //  Check if user exists
        if (!response.rows || response.rows.length === 0) {
          console.error('User not found:', email);
          throw new Error('User not found');
        }

        const user = response.rows[0].value;
        console.log(' Retrieved User:', user);

        //  Validate user structure
        if (!user?.data?.password) {
          console.error('Invalid user data structure:', user);
          throw new Error('Invalid user data structure');
        }
        
   
        console.log(' Stored Password:', `"${user.data.password}"`);
        console.log('Input Password:', `"${password}"`);

        // Password Verification
        if (user.data.password.trim() !== password.trim()) {
          console.error(' Incorrect password for:', email);
          throw new Error('Incorrect password');
        }

        console.log(' Login successful for:', email);
        alert("login successfully")
        return user; // Successful login
      }),
      catchError(error => {
        console.error(' Login failed:', error.message);
        return throwError(() => new Error(error.message));
      })
    );
  }

  
  createDocument(employee: any): Observable<any> {
    employee.type = 'employee'; // Ensure type is set
    return this.http.post<any>(this.baseURL, employee, { headers: this.headers }).pipe(
      catchError(error => {
        console.error(' Error creating employee:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }

  queryDocuments(): Observable<any> {
    const url = `${this.baseURL}/_design/task-management/_view/user_by_role?include_docs=true`;
  
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      map(response => response.rows.map((row: any) => row.doc)), // Extract documents
      catchError(error => {
        console.error(' Error querying employees:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }
  


  getEmployeesByRole(role: 'Manager' | 'TL'): Observable<any> {
    const url = `${this.baseURL}/_design/task-management/_view/user_by_role?key="${role}"&include_docs=true`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError(error => {
        console.error(` Error fetching ${role}s:`, error);
        return throwError(() => new Error(error.message));
      })
    );
  }
  
  queryTasksByManager(tlId: string): Observable<any> {
    const url = `${this.baseURL}/_design/task-management/_view/tasks_by_manager?key="${tlId}"&include_docs=true`;
  
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      map(response => response.rows.map((row: any) => row.doc)), // Extract docs
      catchError(error => {
        console.error('Error fetching assigned tasks:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }
  
  
  getEmployeesByTL(tlId: string): Observable<any> {
    const url = `${this.baseURL}/_design/task-management/_view/employees_by_tl?key="${tlId}"&include_docs=true`;

    console.log('ℹ️ Fetching Employees from:', url);  // ✅ Logs exact URL

    return this.http.get<any>(url, { headers: this.headers }).pipe(
      tap(response => console.log('📥 Raw Response:', response)),  // ✅ Debug response
      map(response => {
        console.log('📊 Total Rows:', response.total_rows);
        console.log('📌 View Rows:', response.rows);

        if (!response.rows || response.rows.length === 0) {
          console.warn('⚠️ No employees found for TL ID:', tlId);
          return [];
        }

        return response.rows.map((row: { doc: any; }) => row.doc); // ✅ Extract employee docs
      }),
      catchError(error => {
        console.error(`❌ Error fetching employees for TL ${tlId}:`, error);
        return throwError(() => new Error(error.message));
      })
    );
  }

  
  
  
  
  
  
  
  
  
  
}
