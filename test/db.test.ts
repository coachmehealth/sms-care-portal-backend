import {
  connectDatabase,
  clearDatabase,
  closeDatabase,
  getTestToken,
} from './db';

if (process.env.NODE_ENV === 'development') {
  const tokenObject = { token: [] };
  beforeAll(async (done: any) => {
    await connectDatabase();
    await getTestToken(tokenObject, done);
  });
  beforeEach(async () => clearDatabase());
  afterAll(() => closeDatabase());
  it('database can return a token for authorization', async (done) => {
    expect(tokenObject.token).toBeTruthy();
    done();
  });
}
