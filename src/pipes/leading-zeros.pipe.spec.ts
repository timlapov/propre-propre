import { LeadingZerosPipe } from './leading-zeros.pipe';

describe('LeadingZerosPipe', () => {
  it('create an instance', () => {
    const pipe = new LeadingZerosPipe();
    expect(pipe).toBeTruthy();
  });
});
