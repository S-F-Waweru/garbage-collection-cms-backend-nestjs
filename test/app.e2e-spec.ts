import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let createdLocationId: string; // CHANGE: Store created entity ID for other tests

  // Setup: Run once before all tests
  beforeAll(async () => {
    // CHANGE: Import your AppModule (contains all modules)
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Cleanup: Run once after all tests
  afterAll(async () => {
    await app.close();
  });

  // TEST GROUP 1: CREATE endpoint
  describe('/locations (POST)', () => {
    it('should create a new location', () => {
      return request(app.getHttpServer())
        .post('/locations') // CHANGE: Your endpoint path
        .send({
          // CHANGE: Your DTO properties
          city: 'Nairobi',
          region: 'Westlands',
        })
        .expect(201) // CHANGE: Expected status code (201 for POST)
        .then((response) => {
          // CHANGE: Assert response properties match your entity
          expect(response.body).toHaveProperty('id');
          expect(response.body.city).toBe('Nairobi');
          expect(response.body.region).toBe('Westlands');
          // Save ID for use in other tests
          createdLocationId = response.body.id;
        });
    });

    it('should fail to create duplicate location', () => {
      return request(app.getHttpServer())
        .post('/locations') // CHANGE: Your endpoint path
        .send({
          // CHANGE: Same data to trigger duplicate error
          city: 'Nairobi',
          region: 'Westlands',
        })
        .expect(409); // CHANGE: Expected error status (409 Conflict, 400 Bad Request, etc.)
    });
  });

  // TEST GROUP 2: GET ALL endpoint
  describe('/locations (GET)', () => {
    it('should return all locations', () => {
      return request(app.getHttpServer())
        .get('/locations') // CHANGE: Your endpoint path
        .expect(200) // GET typically returns 200
        .then((response) => {
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBeGreaterThan(0);
        });
    });
  });

  // TEST GROUP 3: GET BY ID endpoint
  describe('/locations/:id (GET)', () => {
    it('should return a location by id', () => {
      return request(app.getHttpServer())
        .get(`/locations/${createdLocationId}`) // CHANGE: Your endpoint path with ID
        .expect(200)
        .then((response) => {
          // CHANGE: Assert response matches your entity
          expect(response.body.id).toBe(createdLocationId);
          expect(response.body.city).toBe('Nairobi');
        });
    });

    it('should return 404 for non-existent location', () => {
      return request(app.getHttpServer())
        .get('/locations/non-existent-id') // CHANGE: Your endpoint path
        .expect(404); // Not found
    });
  });

  // TEST GROUP 4: UPDATE endpoint
  describe('/locations/:id (PUT)', () => {
    it('should update a location', () => {
      return request(app.getHttpServer())
        .put(`/locations/${createdLocationId}`) // CHANGE: Your endpoint path with ID
        .send({
          // CHANGE: Updated DTO properties
          city: 'Nairobi',
          region: 'Kilimani',
        })
        .expect(200) // PUT typically returns 200
        .then((response) => {
          // CHANGE: Assert updated property
          expect(response.body.region).toBe('Kilimani');
        });
    });
  });

  // TEST GROUP 5: DELETE endpoint
  describe('/locations/:id (DELETE)', () => {
    it('should delete a location', () => {
      return request(app.getHttpServer())
        .delete(`/locations/${createdLocationId}`) // CHANGE: Your endpoint path with ID
        .expect(200)
        .then((response) => {
          // CHANGE: Assert your delete response message
          expect(response.body.message).toBe('Location deleted successfully');
        });
    });

    it('should return 404 when deleting non-existent location', () => {
      return request(app.getHttpServer())
        .delete(`/locations/${createdLocationId}`) // Same ID (already deleted)
        .expect(404);
    });
  });
});
