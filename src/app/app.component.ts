import { Component } from "@angular/core";
import { AppService } from "./services/app.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "QA Automation Coverage Dashboard";
  authenticated: boolean = false;
  constructor(private appService: AppService) {
    this.appService.authenticated.subscribe((value) => {
      this.authenticated = value;
      this.appService.isAuthorised = value;
    });
  }
}
