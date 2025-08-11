import { Component } from "@angular/core";
import { AppService } from "./services/app.service";
import { SessionStorageService } from "./services/session-storage.service";
import { ApiService } from "./services/api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "QA Automation Coverage Dashboard";
  authenticated: boolean = false;
  
  // Global search properties
  globalSearchKeyword: string = '';
  globalSearchLoading: boolean = false;
  globalSearchResult: { count: number; keyword: string } | null = null;
  
  constructor(
    private appService: AppService,
    private sessionStorageService: SessionStorageService,
    private apiService: ApiService
  ) {
    this.appService.authenticated.subscribe((value) => {
      this.authenticated = value;
      this.appService.isAuthorised = value;
    });
  }
  
  logout() {
    this.sessionStorageService.removeItem("userInfo");
    window.location.reload();
  }
  
  performGlobalSearch() {
    if (!this.globalSearchKeyword || this.globalSearchKeyword.trim().length < 3) {
      return;
    }
    
    this.globalSearchLoading = true;
    this.globalSearchResult = null;
    
    this.apiService.getGlobalSearchCount(this.globalSearchKeyword.trim()).subscribe(
      (result) => {
        this.globalSearchResult = result;
        this.globalSearchLoading = false;
        
        // Auto-hide result after 5 seconds
        setTimeout(() => {
          this.globalSearchResult = null;
        }, 5000);
      },
      (error) => {
        console.error('Global search error:', error);
        this.globalSearchLoading = false;
        this.globalSearchResult = { count: 0, keyword: this.globalSearchKeyword.trim() };
        
        // Auto-hide error after 3 seconds
        setTimeout(() => {
          this.globalSearchResult = null;
        }, 3000);
      }
    );
  }
}
