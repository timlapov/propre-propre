import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { servicesGuard } from './services.guard';

describe('servicesGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => servicesGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
