import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TesterRegistrationComponent } from './components/tester-registration/tester-registration.component';
import { ProjectManagementComponent } from './components/project-management/project-management.component';
import { TestCaseTrackingComponent } from './components/test-case-tracking/test-case-tracking.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'testers', component: TesterRegistrationComponent },
  { path: 'projects', component: ProjectManagementComponent },
  { path: 'test-cases', component: TestCaseTrackingComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
