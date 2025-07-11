import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.css']
})
export class ProjectManagementComponent implements OnInit {
  projectForm: FormGroup;
  projects: Project[] = [];
  loading = false;
  editingProject: Project | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['Active', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProjects();
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading = true;
      const projectData = this.projectForm.value;

      if (this.editingProject) {
        this.apiService.updateProject(this.editingProject.id, projectData).subscribe(
          (response) => {
            this.loadProjects();
            this.resetForm();
            this.loading = false;
          },
          (error) => {
            console.error('Error updating project:', error);
            this.loading = false;
          }
        );
      } else {
        this.apiService.createProject(projectData).subscribe(
          (response) => {
            this.loadProjects();
            this.resetForm();
            this.loading = false;
          },
          (error) => {
            console.error('Error creating project:', error);
            this.loading = false;
          }
        );
      }
    }
  }

  loadProjects(): void {
    this.apiService.getProjects().subscribe(
      (data: Project[]) => {
        this.projects = data;
      },
      (error) => {
        console.error('Error loading projects:', error);
      }
    );
  }

  editProject(project: Project): void {
    this.editingProject = project;
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      status: project.status
    });
  }

  deleteProject(id: number): void {
    if (confirm('Are you sure you want to delete this project? This will also delete all associated test cases.')) {
      this.apiService.deleteProject(id).subscribe(
        () => {
          this.loadProjects();
        },
        (error) => {
          console.error('Error deleting project:', error);
        }
      );
    }
  }

  resetForm(): void {
    this.projectForm.reset();
    this.projectForm.patchValue({ status: 'Active' });
    this.editingProject = null;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Inactive':
        return 'bg-danger';
      case 'Completed':
        return 'bg-primary';
      default:
        return 'bg-secondary';
    }
  }
}
