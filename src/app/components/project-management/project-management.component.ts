import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Project, Domain } from '../../models/project.model';
import { AppService } from '../../services/app.service';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-project-management',
  templateUrl: './project-management.component.html',
  styleUrls: ['./project-management.component.css']
})
export class ProjectManagementComponent implements OnInit {
  projectForm: FormGroup;
  projects: Project[] = [];
  domains: Domain[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  editingProject: Project | null = null;
  selectedDomainFilter: string = '';
  showRegistration:boolean = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private appService: AppService
  ) {
    this.projectForm = this.fb.group({
      domainId: ['', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      status: ['Active', Validators.required]
    });
    this.showRegistration = this.appService.userPermission?.permission === environment.appWrite;
  }

  ngOnInit(): void {
    this.loadDomains();
    this.loadProjects();
  }

  loadDomains(): void {
    this.apiService.getActiveDomains().subscribe(
      (data: Domain[]) => {
        this.domains = data;
      },
      (error) => {
        console.error('Error loading domains:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading = true;
      const formData = this.projectForm.value;

      // Create project data with domain reference
      const projectData: any = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        domain: {
          id: formData.domainId
        }
      };

      if (this.editingProject) {
        this.apiService.updateProject(this.editingProject.id, projectData).subscribe(
          (response) => {
            this.loadProjects();
            this.resetForm();
            this.loading = false;
          },
          (error) => {
            console.error('Error updating project:', error);
            alert('Error updating project: ' + (error.error || error.message));
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
            alert('Error creating project: ' + (error.error || error.message));
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
        this.applyDomainFilter();
      },
      (error) => {
        console.error('Error loading projects:', error);
      }
    );
  }

  onDomainFilterChange(): void {
    this.applyDomainFilter();
  }

  applyDomainFilter(): void {
    if (this.selectedDomainFilter) {
      this.filteredProjects = this.projects.filter(project =>
        project.domain && project.domain.id.toString() === this.selectedDomainFilter
      );
    } else {
      this.filteredProjects = [...this.projects];
    }
  }

  editProject(project: Project): void {
    this.editingProject = project;
    this.projectForm.patchValue({
      domainId: project.domain ? project.domain.id : '',
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
          alert('Error deleting project: ' + (error.error || error.message));
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

  getDomainName(domainId: number): string {
    const domain = this.domains.find(d => d.id === domainId);
    return domain ? domain.name : 'Unknown Domain';
  }
}