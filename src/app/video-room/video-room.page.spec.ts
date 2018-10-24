import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoRoomPage } from './video-room.page';

describe('VideoRoomPage', () => {
  let component: VideoRoomPage;
  let fixture: ComponentFixture<VideoRoomPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoRoomPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoRoomPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
