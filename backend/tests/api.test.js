const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

let farmerToken;
let adminToken;

beforeAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Register & login a farmer
  const farmer = {
    fullName: 'API Test Farmer',
    email: `apifarmer${Date.now()}@test.com`,
    password: 'farmer123456'
  };
  const farmerRes = await request(app).post('/api/auth/register').send(farmer);
  farmerToken = farmerRes.body.data.token;

  // Try to login as admin (seeded)
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@agrismart360.com', password: 'admin123' });

  if (adminRes.statusCode === 200) {
    adminToken = adminRes.body.data.token;
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Locations API', () => {
  it('GET /api/locations should return locations', async () => {
    const res = await request(app).get('/api/locations');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/locations/countries should return countries', async () => {
    const res = await request(app).get('/api/locations/countries');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Crops API', () => {
  it('GET /api/crops should return crops', async () => {
    const res = await request(app).get('/api/crops');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/crops?category=grain should filter by category', async () => {
    const res = await request(app).get('/api/crops?category=grain');
    expect(res.statusCode).toBe(200);
    if (res.body.data.length > 0) {
      expect(res.body.data[0].category).toBe('grain');
    }
  });
});

describe('Prices API', () => {
  it('GET /api/prices/latest should return latest prices', async () => {
    const res = await request(app)
      .get('/api/prices/latest')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/prices/latest?priceType=national should filter by type', async () => {
    const res = await request(app)
      .get('/api/prices/latest?priceType=national')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('News API', () => {
  it('GET /api/news should return published news', async () => {
    const res = await request(app)
      .get('/api/news')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.total).toBeDefined();
    expect(res.body.pages).toBeDefined();
  });

  it('GET /api/news/meta/categories should return categories', async () => {
    const res = await request(app).get('/api/news/meta/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBe(7);
  });
});

describe('Notifications API', () => {
  it('GET /api/notifications should return user notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBeDefined();
  });

  it('PUT /api/notifications/read-all should mark all as read', async () => {
    const res = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/notifications should reject without auth', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.statusCode).toBe(401);
  });
});

describe('Disease API', () => {
  it('GET /api/disease/list should return disease database', async () => {
    const res = await request(app).get('/api/disease/list');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBeGreaterThan(0);
  });

  it('GET /api/disease/list?crop=wheat should filter by crop', async () => {
    const res = await request(app).get('/api/disease/list?crop=wheat');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/disease/detect should detect disease from description', async () => {
    const res = await request(app)
      .post('/api/disease/detect')
      .set('Authorization', `Bearer ${farmerToken}`)
      .field('description', 'brown spots on wheat leaves with rust color')
      .field('crop', 'Wheat');

    // Should either find a disease or return 404
    expect([200, 404]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      expect(res.body.data.disease.name).toBeDefined();
      expect(res.body.data.confidence).toBeDefined();
    }
  });

  it('POST /api/disease/chat should return farming advice', async () => {
    const res = await request(app)
      .post('/api/disease/chat')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ message: 'How to treat wheat rust?', language: 'en' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.reply).toBeDefined();
  });
});

describe('User Profile API', () => {
  it('PUT /api/users/profile should update profile', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({ fullName: 'Updated Farmer Name', language: 'en' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Updated Farmer Name');
  });

  it('PUT /api/users/profile should reject without auth', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .send({ fullName: 'Hacker' });

    expect(res.statusCode).toBe(401);
  });
});

describe('Admin API', () => {
  const runAdminTest = adminToken ? it : it.skip;

  runAdminTest('GET /api/admin/analytics should return analytics', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalUsers).toBeDefined();
    expect(res.body.data.totalCrops).toBeDefined();
  });

  runAdminTest('GET /api/admin/users should return user list', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBeDefined();
  });

  it('GET /api/admin/analytics should reject non-admin', async () => {
    const res = await request(app)
      .get('/api/admin/analytics')
      .set('Authorization', `Bearer ${farmerToken}`);

    expect(res.statusCode).toBe(403);
  });
});

describe('Swagger Documentation', () => {
  it('GET /api-docs should serve swagger UI', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.statusCode).toBe(200);
    // HTML content type expected for swagger-ui-express redirect or page
    expect(res.headers['content-type']).toMatch(/html/);
  });
});
