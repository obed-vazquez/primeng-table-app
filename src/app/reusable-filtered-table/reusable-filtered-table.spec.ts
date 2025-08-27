import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableFilteredTable } from './reusable-filtered-table';

describe('GenericFilteredTable', () => {
  let component: ReusableFilteredTable;
  let fixture: ComponentFixture<ReusableFilteredTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReusableFilteredTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableFilteredTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
