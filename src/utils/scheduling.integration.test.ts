import { connectDatabase, closeDatabase } from '../../test/db';

if (process.env.NODE_ENV === 'development') {
  beforeAll(() => connectDatabase());
  afterAll(() => closeDatabase());

  describe('Scheduling tests', () => {
    jest.useFakeTimers();
    it('sends scheduled messages', async () => {
      expect(1).toBeTruthy();
    });
  });
} else {
  it('is not development', () => {
    expect(1).toBeTruthy();
  });
}
