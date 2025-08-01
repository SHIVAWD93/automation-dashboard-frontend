import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginDashboardComponent } from './login-dashboard.component';

describe('LoginDashboardComponent', () => {
  let component: LoginDashboardComponent;
  let fixture: ComponentFixture<LoginDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
