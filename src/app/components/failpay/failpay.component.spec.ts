import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailpayComponent } from './failpay.component';

describe('FailpayComponent', () => {
  let component: FailpayComponent;
  let fixture: ComponentFixture<FailpayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FailpayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailpayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
