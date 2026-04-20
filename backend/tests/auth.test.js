const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

// Use a test database
beforeAll(async () => {
  // Wait for DB connection
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Health Check', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Auth - Register', () => {
  const testUser = {
    fullName: 'Test Farmer',
    email: `testfarmer${Date.now()}@test.com`,
    password: 'testpass123',
    language: 'en'
  };

  it('POST /api/auth/register should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
    expect(res.body.data.user.fullName).toBe(testUser.fullName);
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.role).toBe('farmer');
  });

  it('POST /api/auth/register should reject duplicate email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/register should reject missing password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'No Pass', email: 'nopass@test.com' });

    expect(res.statusCode).toBe(400);
  });
});

describe('Auth - Login', () => {
  const loginUser = {
    fullName: 'Login Tester',
    email: `logintest${Date.now()}@test.com`,
    password: 'loginpass123',
    language: 'en'
  };

  let authToken;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(loginUser);
  });

  it('POST /api/auth/login should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginUser.email, password: loginUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
  });

  it('POST /api/auth/login should reject wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: loginUser.email, password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/auth/me should return user with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(loginUser.email);
  });

  it('GET /api/auth/me should reject without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  it('POST /api/auth/forgot-password should accept valid email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: loginUser.email });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/auth/forgot-password should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'nonexistent@test.com' });

    expect(res.statusCode).toBe(404);
  });
});

describe('Auth - Refresh Token', () => {
  let refreshToken;

  beforeAll(async () => {
    const user = {
      fullName: 'Refresh Tester',
      email: `refresh${Date.now()}@test.com`,
      password: 'refreshpass123'
    };
    const res = await request(app).post('/api/auth/register').send(user);
    refreshToken = res.body.data.refreshToken;
  });

  it('POST /api/auth/refresh-token should return new tokens', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it('POST /api/auth/refresh-token should reject invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: 'invalid_token' });

    expect(res.statusCode).toBe(401);
  });
});
