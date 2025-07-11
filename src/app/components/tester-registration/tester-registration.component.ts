import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Tester } from '../../models/tester.model';

@Component({
  selector: 'app-tester-registration',
  templateUrl: './tester-registration.component.html',
  styleUrls: ['./tester-registration.component.css']
})
export class TesterRegistrationComponent implements OnInit {
  testerForm: FormGroup;
  testers: Tester[] = [];
  loading = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.testerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['', Validators.required],
      gender: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTesters();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.testerForm.valid) {
      this.loading = true;
      const formData = new FormData();
      
      formData.append('name', this.testerForm.get('name')?.value);
      formData.append('role', this.testerForm.get('role')?.value);
      formData.append('gender', this.testerForm.get('gender')?.value);
      
      if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile);
      }

      this.apiService.createTester(formData).subscribe(
        (response) => {
          this.loadTesters();
          this.resetForm();
          this.loading = false;
        },
        (error) => {
          console.error('Error creating tester:', error);
          this.loading = false;
        }
      );
    }
  }

  loadTesters(): void {
    this.apiService.getTesters().subscribe(
      (data: Tester[]) => {
        this.testers = data;
      },
      (error) => {
        console.error('Error loading testers:', error);
      }
    );
  }

  deleteTester(id: number): void {
    if (confirm('Are you sure you want to delete this tester?')) {
      this.apiService.deleteTester(id).subscribe(
        () => {
          this.loadTesters();
        },
        (error) => {
          console.error('Error deleting tester:', error);
        }
      );
    }
  }

  resetForm(): void {
    this.testerForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'Manual Tester':
        return 'bg-primary';
      case 'Automation Tester':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
}
