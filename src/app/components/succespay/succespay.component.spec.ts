import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccespayComponent } from './succespay.component';

describe('SuccespayComponent', () => {
  let component: SuccespayComponent;
  let fixture: ComponentFixture<SuccespayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuccespayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccespayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
