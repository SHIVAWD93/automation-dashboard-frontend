import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Project } from '../../models/project.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  selectedProject: Project | null = null;
  dashboardStats: any = {};
  coverageChart: any;
  statusChart: any;
  domainNames:any;
  loading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProjects();
    this.loadDashboardStats();
    this.apiService.getDomainNames().subscribe(
      (domains) =>{
        this.domainNames = domains;
      }
    )
  }

  loadProjects(): void {
    this.apiService.getProjects().subscribe(
      (data: Project[]) => {
        this.projects = data;
        if (this.projects.length > 0) {
          this.selectedProject = this.projects[0];
          this.loadProjectStats();
        }
      },
      (error) => {
        console.error('Error loading projects:', error);
      }
    );
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.apiService.getDashboardStats().subscribe(
      (stats) => {
        this.dashboardStats = stats;
        this.createCoverageChart();
        this.loading = false;
      },
      (error) => {
        console.error('Error loading dashboard stats:', error);
        this.loading = false;
      }
    );
  }

  onProjectChange(): void {
    this.loadProjectStats();
  }

  loadProjectStats(): void {
    if (this.selectedProject) {
      this.apiService.getProjectStats(this.selectedProject.id).subscribe(
        (stats) => {
          this.createStatusChart(stats);
        },
        (error) => {
          console.error('Error loading project stats:', error);
        }
      );
    }
  }

  createCoverageChart(): void {
    const ctx = document.getElementById('coverageChart') as HTMLCanvasElement;
    if (this.coverageChart) {
      this.coverageChart.destroy();
    }

    this.coverageChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Automated', 'Manual', 'In Progress'],
        datasets: [{
          data: [
            this.dashboardStats.automatedCount || 0,
            this.dashboardStats.manualCount || 0,
            this.dashboardStats.inProgressCount || 0
          ],
          backgroundColor: [
            '#28a745',
            '#dc3545',
            '#ffc107'
          ],
          borderColor: [
            '#ffffff',
            '#ffffff',
            '#ffffff'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }

  createStatusChart(stats: any): void {
    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Ready to Automate', 'Automated', 'In Progress', 'Completed'],
        datasets: [{
          data: [
            stats.readyToAutomateCount || 0,
            stats.automatedCount || 0,
            stats.inProgressCount || 0,
            stats.completedCount || 0
          ],
          backgroundColor: [
            '#17a2b8',
            '#28a745',
            '#ffc107',
            '#6f42c1'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }
}
