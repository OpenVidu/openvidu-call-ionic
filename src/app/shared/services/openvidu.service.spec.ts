import { TestBed, inject } from '@angular/core/testing';

import { OpenviduService } from './openvidu.service';

describe('OpenviduService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OpenviduService]
    });
  });

  it('should be created', inject([OpenviduService], (service: OpenviduService) => {
    expect(service).toBeTruthy();
  }));
});
