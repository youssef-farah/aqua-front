import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffresboutiqueComponent } from './offresboutique.component';

describe('OffresboutiqueComponent', () => {
  let component: OffresboutiqueComponent;
  let fixture: ComponentFixture<OffresboutiqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OffresboutiqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffresboutiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
