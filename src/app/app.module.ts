import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TesterRegistrationComponent } from './components/tester-registration/tester-registration.component';
import { ProjectManagementComponent } from './components/project-management/project-management.component';
import { TestCaseTrackingComponent } from './components/test-case-tracking/test-case-tracking.component';
import { DropdownModule } from 'primeng/dropdown';
import { BulkUploadComponent } from './components/bulk-upload/bulk-upload.component';


import { ApiService } from './services/api.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    TesterRegistrationComponent,
    ProjectManagementComponent,
    TestCaseTrackingComponent,
    BulkUploadComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    DropdownModule
  ],
  providers: [ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
