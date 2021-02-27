import { parseTwilioFromNumber } from '../../src/utils/config';

describe('parseTwilioFromNumber', () => {
  it('throws an error if no process values is set', () => {
    expect(() => {
      parseTwilioFromNumber(undefined);
    }).toThrow();
  });

  it('strips unwanted characters from the number', () => {
    expect(parseTwilioFromNumber('408-460-9195')).toEqual('4084609195');
  });
});
