const request = require('supertest');
const app = require('../server');

describe('GET /api/games', () => {
  it('Debería retornar una lista de juegos', async () => {
    const res = await request(app).get('/api/games').set('Authorization', 'Bearer fake-token');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });
});
