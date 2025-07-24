import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Directive({
  selector: '[appRoleAccess]'
})
export class RoleAccessDirective implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();
  private requiredRoles: UserRole[] = [];
  private requireWriteAccess = false;

  @Input() set appRoleAccess(roles: UserRole | UserRole[] | 'write' | 'read') {
    if (roles === 'write') {
      this.requireWriteAccess = true;
    } else if (roles === 'read') {
      // Read access is default for authenticated users
      this.requiredRoles = [];
    } else if (Array.isArray(roles)) {
      this.requiredRoles = roles;
    } else if (roles) {
      this.requiredRoles = [roles];
    }
    this.updateView();
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.authState$.subscribe(() => {
        this.updateView();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private updateView(): void {
    this.viewContainer.clear();

    if (this.hasAccess()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  private hasAccess(): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    if (this.requireWriteAccess) {
      return this.authService.hasWriteAccess();
    }

    if (this.requiredRoles.length === 0) {
      return true; // Read access for all authenticated users
    }

    const currentUser = this.authService.getCurrentUser();
    return currentUser ? this.requiredRoles.includes(currentUser.role) : false;
  }
}