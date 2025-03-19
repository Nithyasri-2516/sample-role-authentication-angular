import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TlDashboardComponent } from './tl-dashboard.component';

describe('TlDashboardComponent', () => {
  let component: TlDashboardComponent;
  let fixture: ComponentFixture<TlDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TlDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TlDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
