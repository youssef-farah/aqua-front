import { TestBed } from '@angular/core/testing';

import { OrderItemServiceService } from './order-item-service.service';

describe('OrderItemServiceService', () => {
  let service: OrderItemServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderItemServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
