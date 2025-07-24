import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkAccess(route);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if route has role requirements
    const requiredRoles = route.data['roles'] as UserRole[];
    if (requiredRoles && requiredRoles.length > 0) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser || !requiredRoles.includes(currentUser.role)) {
        // User doesn't have required role, redirect to unauthorized page
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}