import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContinfosComponent } from './continfos.component';

describe('ContinfosComponent', () => {
  let component: ContinfosComponent;
  let fixture: ComponentFixture<ContinfosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContinfosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContinfosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
