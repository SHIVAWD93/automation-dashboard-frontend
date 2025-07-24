import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-card">
        <div class="text-center">
          <i class="fas fa-lock icon-large text-warning mb-4"></i>
          <h2 class="mb-3">Access Denied</h2>
          <p class="text-muted mb-4">
            You don't have permission to access this resource.
          </p>
          <div class="alert alert-warning" role="alert">
            <i class="fas fa-info-circle me-2"></i>
            Your current role ({{ getCurrentRole() }}) doesn't have the required permissions.
          </div>
          <div class="d-flex gap-2 justify-content-center">
            <button class="btn btn-primary" (click)="goToDashboard()">
              <i class="fas fa-home me-2"></i>
              Go to Dashboard
            </button>
            <button class="btn btn-outline-secondary" (click)="goBack()">
              <i class="fas fa-arrow-left me-2"></i>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .unauthorized-card {
      background: white;
      border-radius: 15px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      max-width: 500px;
      width: 100%;
    }
    
    .icon-large {
      font-size: 4rem;
    }
    
    @media (max-width: 576px) {
      .unauthorized-card {
        padding: 30px 20px;
      }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  getCurrentRole(): string {
    const user = this.authService.getCurrentUser();
    return user ? (user.role === 'admin' ? 'Administrator' : 'Maintainer') : 'Unknown';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }
}