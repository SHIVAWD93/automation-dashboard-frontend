import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { User, UserRole } from './models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'QA Automation Coverage Dashboard';
  currentUser: User | null = null;
  isAuthenticated = false;
  showMobileMenu = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.authService.authState$.subscribe(authState => {
      this.isAuthenticated = authState.isAuthenticated;
      this.currentUser = authState.user;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isMaintainer(): boolean {
    return this.authService.isMaintainer();
  }

  hasWriteAccess(): boolean {
    return this.authService.hasWriteAccess();
  }

  getUserDisplayName(): string {
    if (this.currentUser) {
      return this.currentUser.firstName && this.currentUser.lastName
        ? `${this.currentUser.firstName} ${this.currentUser.lastName}`
        : this.currentUser.username;
    }
    return '';
  }

  getRoleDisplayName(): string {
    if (this.currentUser) {
      return this.currentUser.role === UserRole.ADMIN ? 'Administrator' : 'Maintainer';
    }
    return '';
  }

  getRoleBadgeClass(): string {
    if (this.currentUser) {
      return this.currentUser.role === UserRole.ADMIN ? 'bg-success' : 'bg-info';
    }
    return 'bg-secondary';
  }
}
