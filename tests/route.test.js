// tests/server.test.js
import request from 'supertest';
import { createServer } from 'http';
import { app } from '../server.js';

describe('Express Server Tests', () => {
  let server;
  let httpServer;

  beforeAll((done) => {
    // Create HTTP server on different port
    httpServer = createServer(app);
    server = httpServer.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    // Close server after test
    server.close(() => {
      done();
    });
  });

  describe('Route Testing', () => {
    it('should return 200 and HTML content for GET /', async () => {
      const response = await request(server)
        .get('/')
        .expect(200);

      expect(response.text).toContain('<!DOCTYPE html>');
      expect(response.headers['content-type']).toMatch(/html/);
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(server)
        .get('/non/existent/route')
        .expect(200);

      expect(response.status).toBe(200);
      expect(response.text).toContain('<!DOCTYPE html>');
    });

    it('should return 200 and HTML content for GET /room', async () => {
        const response = await request(server)
            .get('/room')
            .expect(200);
        expect(response.text).toContain('<!DOCTYPE html>');
    });
    it('should return 200 and HTML content for GET /room/user', async () => {
        const response = await request(server)
            .get('/room/user')
            .expect(200);
        expect(response.text).toContain('<!DOCTYPE html>');
    });

    it('should handle invalid HTTP methods gracefully', async () => {
      await request(server)
        .patch('/')
        .expect(404);
    });
  });

  describe('Server Health', () => {
    it('should respond to requests within reasonable time', async () => {
      const startTime = Date.now();
      
      await request(server)
        .get('/')
        .expect(200);
        
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(1000); // Moins d'une seconde
    });
  });
});