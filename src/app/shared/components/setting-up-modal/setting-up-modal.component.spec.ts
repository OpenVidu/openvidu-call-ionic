import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingUpModalComponent } from './setting-up-modal.component';

describe('SettingUpModalComponent', () => {
  let component: SettingUpModalComponent;
  let fixture: ComponentFixture<SettingUpModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingUpModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingUpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
