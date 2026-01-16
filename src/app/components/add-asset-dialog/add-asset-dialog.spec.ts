import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAssetDialog } from './add-asset-dialog';

describe('AddAssetDialog', () => {
  let component: AddAssetDialog;
  let fixture: ComponentFixture<AddAssetDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAssetDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAssetDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
