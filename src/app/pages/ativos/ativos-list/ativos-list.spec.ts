import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtivosListComponent } from './ativos-list.component';

describe('AtivosList', () => {
  let component: AtivosListComponent;
  let fixture: ComponentFixture<AtivosListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AtivosListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AtivosListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
