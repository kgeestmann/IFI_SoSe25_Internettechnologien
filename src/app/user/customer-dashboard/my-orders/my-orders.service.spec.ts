import { TestBed } from '@angular/core/testing';
import { testProviders } from '../../../../testing/test-providers';

import { MyOrdersService } from './my-orders.service';

describe('MyOrdersService', () => {
  let service: MyOrdersService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testProviders });
    service = TestBed.inject(MyOrdersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
