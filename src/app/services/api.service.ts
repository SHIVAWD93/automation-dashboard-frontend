import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Tester } from '../models/tester.model';
import { Project } from '../models/project.model';
import { TestCase } from '../models/test-case.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  // Tester endpoints
  getTesters(): Observable<Tester[]> {
    return this.http.get<Tester[]>(`${this.baseUrl}/testers`)
      .pipe(catchError(this.handleError));
  }

  createTester(testerData: FormData): Observable<Tester> {
    return this.http.post<Tester>(`${this.baseUrl}/testers`, testerData)
      .pipe(catchError(this.handleError));
  }

  deleteTester(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/testers/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Project endpoints
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`)
      .pipe(catchError(this.handleError));
  }

  createProject(projectData: any): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, projectData)
      .pipe(catchError(this.handleError));
  }

  updateProject(id: number, projectData: any): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, projectData)
      .pipe(catchError(this.handleError));
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Test Case endpoints
  getTestCases(): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(`${this.baseUrl}/test-cases`)
      .pipe(catchError(this.handleError));
  }

  createTestCase(testCaseData: any): Observable<TestCase> {
    return this.http.post<TestCase>(`${this.baseUrl}/test-cases`, testCaseData)
      .pipe(catchError(this.handleError));
  }

  updateTestCase(id: number, testCaseData: any): Observable<TestCase> {
    return this.http.put<TestCase>(`${this.baseUrl}/test-cases/${id}`, testCaseData)
      .pipe(catchError(this.handleError));
  }

  deleteTestCase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/test-cases/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Dashboard endpoints
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/stats`)
      .pipe(catchError(this.handleError));
  }

  getProjectStats(projectId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/project-stats/${projectId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
