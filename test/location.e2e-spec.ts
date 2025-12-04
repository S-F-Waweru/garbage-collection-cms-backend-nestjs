import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('LocationController (e2e)', () => {
  let app: INestApplication;
  let locationId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create an initial location for duplicate test
    const response = await request(app.getHttpServer())
      .post('/locations')
      .send({ city: 'Nairobi', region: 'Westlands' });
    locationId = response.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/locations (POST)', () => {
    it('should create a new location', async () => {
      const res = await request(app.getHttpServer())
        .post('/locations')
        .send({ city: 'Mombasa', region: 'Nyali' })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.city).toBe('Mombasa');
      expect(res.body.region).toBe('Nyali');
    });

    it('should fail to create duplicate location', async () => {
      await request(app.getHttpServer())
        .post('/locations')
        .send({ city: 'Nairobi', region: 'Westlands' })
        .expect(409); // duplicate
    });
  });

  describe('/locations (GET)', () => {
    it('should return all locations', async () => {
      const res = await request(app.getHttpServer())
        .get('/locations')
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('/locations/:id (GET)', () => {
    it('should return a location by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/locations/${locationId}`)
        .expect(200);

      expect(res.body.id).toBe(locationId);
      expect(res.body.city).toBe('Nairobi');
    });

    it('should return 404 for non-existent location', async () => {
      await request(app.getHttpServer())
        .get('/locations/non-existent-id')
        .expect(404);
    });
  });

  describe('/locations/:id (PUT)', () => {
    it('should update a location', async () => {
      const res = await request(app.getHttpServer())
        .put(`/locations/${locationId}`)
        .send({ city: 'Nairobi', region: 'Kilimani' })
        .expect(200);

      expect(res.body.region).toBe('Kilimani');
    });
  });

  describe('/locations/:id (DELETE)', () => {
    it('should delete a location', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/locations/${locationId}`)
        .expect(200);

      expect(res.body.message).toBe('Location deleted successfully');
    });

    it('should return 404 when deleting non-existent location', async () => {
      await request(app.getHttpServer())
        .delete(`/locations/${locationId}`)
        .expect(404);
    });
  });
});
