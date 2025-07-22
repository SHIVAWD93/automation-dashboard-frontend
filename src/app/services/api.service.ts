import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Project } from '../models/project.model';
import { Domain } from '../models/project.model';
import { TestCase } from '../models/test-case.model';
import { Tester } from '../models/tester.model';
import { JenkinsResult, JenkinsTestCase, JenkinsStatistics, JenkinsConnectionTest } from '../models/jenkins.model';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
private baseUrl = environment.apiUrl;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Domain API methods
  getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${this.baseUrl}/domains`)
      .pipe(catchError(this.handleError));
  }

  getActiveDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${this.baseUrl}/domains/active`)
      .pipe(catchError(this.handleError));
  }

  getDomainById(id: number): Observable<Domain> {
    return this.http.get<Domain>(`${this.baseUrl}/domains/${id}`)
      .pipe(catchError(this.handleError));
  }

  createDomain(domain: Domain): Observable<Domain> {
    return this.http.post<Domain>(`${this.baseUrl}/domains`, domain, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateDomain(id: number, domain: Domain): Observable<Domain> {
    return this.http.put<Domain>(`${this.baseUrl}/domains/${id}`, domain, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteDomain(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/domains/${id}`)
      .pipe(catchError(this.handleError));
  }

  getDomainsByStatus(status: string): Observable<Domain[]> {
    return this.http.get<Domain[]>(`${this.baseUrl}/domains/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  // Project API methods
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`)
      .pipe(catchError(this.handleError));
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`)
      .pipe(catchError(this.handleError));
  }

  createProject(project: any): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, project, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateProject(id: number, project: any): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${id}`, project, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${id}`)
      .pipe(catchError(this.handleError));
  }

  getProjectsByDomain(domainId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/domain/${domainId}`)
      .pipe(catchError(this.handleError));
  }

  getProjectsByDomainAndStatus(domainId: number, status: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/domain/${domainId}/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  getProjectsByStatus(status: string): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/status/${status}`)
      .pipe(catchError(this.handleError));
  }

  // Test Case API methods
  getTestCases(): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(`${this.baseUrl}/testcases`)
      .pipe(catchError(this.handleError));
  }

  getTestCaseById(id: number): Observable<TestCase> {
    return this.http.get<TestCase>(`${this.baseUrl}/testcases/${id}`)
      .pipe(catchError(this.handleError));
  }

  createTestCase(testCase: TestCase): Observable<TestCase> {
    return this.http.post<TestCase>(`${this.baseUrl}/testcases`, testCase, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateTestCase(id: number, testCase: TestCase): Observable<TestCase> {
    return this.http.put<TestCase>(`${this.baseUrl}/testcases/${id}`, testCase, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteTestCase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/testcases/${id}`)
      .pipe(catchError(this.handleError));
  }

  getTestCasesByProject(projectId: number): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(`${this.baseUrl}/testcases/project/${projectId}`)
      .pipe(catchError(this.handleError));
  }

  getTestCasesByDomain(domainId: number): Observable<TestCase[]> {
    return this.http.get<TestCase[]>(`${this.baseUrl}/testcases/domain/${domainId}`)
      .pipe(catchError(this.handleError));
  }

  // Tester API methods
  getTesters(): Observable<Tester[]> {
    return this.http.get<Tester[]>(`${this.baseUrl}/testers`)
      .pipe(catchError(this.handleError));
  }

  getTesterById(id: number): Observable<Tester> {
    return this.http.get<Tester>(`${this.baseUrl}/testers/${id}`)
      .pipe(catchError(this.handleError));
  }

 // Update your existing createTester method to handle both cases
 createTester(tester: Tester): Observable<Tester> {
   return this.http.post<Tester>(`${this.baseUrl}/testers`, tester, this.httpOptions)
     .pipe(catchError(this.handleError));
 }
// Tester API methods with file upload support
createTesterWithImage(formData: FormData): Observable<Tester> {
  // Note: Don't set Content-Type header for FormData, let browser set it
  return this.http.post<Tester>(`${this.baseUrl}/testers/with-image`, formData)
    .pipe(catchError(this.handleError));
}
  updateTester(id: number, tester: Tester): Observable<Tester> {
    return this.http.put<Tester>(`${this.baseUrl}/testers/${id}`, tester, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteTester(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/testers/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Dashboard API methods
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/stats`)
      .pipe(catchError(this.handleError));
  }

  // Bulk upload API methods
  bulkUploadTestCases(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/testcases/bulk-upload`, formData)
      .pipe(catchError(this.handleError));
  }

 // Jenkins API methods
 getJenkinsResults(): Observable<JenkinsResult[]> {
   return this.http.get<JenkinsResult[]>(`${this.baseUrl}/jenkins/results`)
     .pipe(catchError(this.handleError));
 }

 getJenkinsResultByJobName(jobName: string): Observable<JenkinsResult> {
   return this.http.get<JenkinsResult>(`${this.baseUrl}/jenkins/results/${jobName}`)
     .pipe(catchError(this.handleError));
 }

 getJenkinsTestCases(resultId: number): Observable<JenkinsTestCase[]> {
   return this.http.get<JenkinsTestCase[]>(`${this.baseUrl}/jenkins/results/${resultId}/testcases`)
     .pipe(catchError(this.handleError));
 }

 getJenkinsStatistics(): Observable<JenkinsStatistics> {
   return this.http.get<JenkinsStatistics>(`${this.baseUrl}/jenkins/statistics`)
     .pipe(catchError(this.handleError));
 }

 syncJenkinsJobs(): Observable<any> {
   return this.http.post<any>(`${this.baseUrl}/jenkins/sync`, {}, this.httpOptions)
     .pipe(catchError(this.handleError));
 }

 syncSingleJenkinsJob(jobName: string): Observable<any> {
   return this.http.post<any>(`${this.baseUrl}/jenkins/sync/${jobName}`, {}, this.httpOptions)
     .pipe(catchError(this.handleError));
 }

 testJenkinsConnection(): Observable<JenkinsConnectionTest> {
   return this.http.get<JenkinsConnectionTest>(`${this.baseUrl}/jenkins/test-connection`)
     .pipe(catchError(this.handleError));
 }

 // New TestNG specific methods
 generateJenkinsTestNGReport(): Observable<any> {
   return this.http.get<any>(`${this.baseUrl}/jenkins/testng/report`)
     .pipe(catchError(this.handleError));
 }

 getDetailedJenkinsTestCases(jobName: string, buildNumber: string): Observable<any> {
   return this.http.get<any>(`${this.baseUrl}/jenkins/testng/${jobName}/${buildNumber}/testcases`)
     .pipe(catchError(this.handleError));
 }

 syncAndGenerateJenkinsReport(): Observable<any> {
   return this.http.post<any>(`${this.baseUrl}/jenkins/testng/sync-and-report`, {}, this.httpOptions)
     .pipe(catchError(this.handleError));
 }


  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }
}