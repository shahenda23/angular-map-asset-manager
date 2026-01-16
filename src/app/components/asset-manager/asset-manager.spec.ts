import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetManager } from './asset-manager';

describe('AssetManager', () => {
  let component: AssetManager;
  let fixture: ComponentFixture<AssetManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
